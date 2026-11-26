// Street Support VA: the three short Claude checks used by the chat route.
//
// - checkScope: is a typed message about housing and support at all?
// - detectAdviceQuestion: does a typed question match one of the advice topics?
// - interpretWithClaude: which option did a typed answer mean?
//
// The model is set in configuration (CLAUDE_MODEL), not in code, so a model
// retirement is a configuration change (backlog item 81, VA #53). The default is
// claude-sonnet-5-5, Anthropic's recommended replacement for the retired
// claude-sonnet-4-20250514 (retired 15 June 2026).
//
// Every check fails safe. If the call fails, the person's journey carries on as
// if Claude had not been asked: the scope check returns "unclear" (the flow
// proceeds), the advice check finds no topic, and interpretation returns null
// (the normal unclear-answer escalation applies). Safeguarding never waits on
// these calls: the under-16 intercept runs before any of them, and typed text at
// the crisis question is never sent to Claude or matched to advice (route.ts).
//
// Thinking is turned off for these calls. claude-sonnet-5-5 thinks by default,
// and thinking counts towards max_tokens, so a short check could come back with
// no text. On that model thinking is turned off with { type: 'between_tools' };
// 'disabled' is refused. Other models may refuse 'between_tools', so if
// CLAUDE_MODEL changes, NO_THINKING must change with it.
//
// A failure is logged as one line naming the check and the model, with the
// error's status and type. What the person typed is never logged.

import Anthropic from '@anthropic-ai/sdk';

export const DEFAULT_CLAUDE_MODEL = 'claude-sonnet-5-5';

/** The model every check uses: CLAUDE_MODEL if set, otherwise the default. */
export function getClaudeModel(): string {
  const configured = process.env.CLAUDE_MODEL?.trim();
  return configured || DEFAULT_CLAUDE_MODEL; // empty string falls back too
}

type MessagesCreate = Anthropic['messages']['create'];
export interface ClaudeClient {
  messages: { create: MessagesCreate };
}

let client: ClaudeClient | null = null;

function getClient(): ClaudeClient {
  client ??= new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return client;
}

/** Tests only: replace the client (pass null to go back to the real one). */
export function setClaudeClientForTests(c: ClaudeClient | null): void {
  client = c;
}

export type ClaudeCheck = 'scope_check' | 'advice_topic' | 'interpretation';

/** One log line for a failed call: the check, the model, the status and type. Never the input. */
export function logClaudeFailure(check: ClaudeCheck, error: unknown): void {
  const e = error as { status?: number; name?: string; error?: { error?: { type?: string } } };
  const status = typeof e?.status === 'number' ? e.status : 'none';
  const type = e?.error?.error?.type ?? e?.name ?? 'unknown';
  console.error(`[VA] Claude ${check} failed (model ${getClaudeModel()}): status ${status}, ${type}. Continuing without it.`);
}

// SDK 0.39's types predate 'between_tools', hence the cast.
export const NO_THINKING = { type: 'between_tools' } as unknown as Anthropic.ThinkingConfigParam;

/** The reply's text block, found by type: a thinking block may come first. */
function replyText(res: { content: Array<{ type: string; text?: string }> }): string {
  const block = res.content?.find(b => b.type === 'text');
  return block && typeof block.text === 'string' ? block.text.trim().toLowerCase() : '';
}

// Advice topics and their keywords for matching
export const adviceTopics: Record<string, { keywords: string[]; phraseKey: string }> = {
  'council_process': {
    keywords: ['council housing work', 'approach council', 'housing options', 'council process', 'what happens when', 'council help'],
    phraseKey: 'ADVICE_COUNCIL_PROCESS'
  },
  'priority_need': {
    keywords: ['priority need', 'who gets priority', 'priority housing', 'vulnerable', 'priority list'],
    phraseKey: 'ADVICE_PRIORITY_NEED'
  },
  'legally_homeless': {
    keywords: ['legally homeless', 'am i homeless', 'count as homeless', 'what is homeless', 'definition of homeless'],
    phraseKey: 'ADVICE_LEGALLY_HOMELESS'
  },
  'sofa_surfing': {
    keywords: ['sofa surfing', 'staying with friends', 'staying with family', 'couch surfing', 'no fixed address', 'staying temporarily'],
    phraseKey: 'ADVICE_SOFA_SURFING'
  },
  'eviction': {
    keywords: ['eviction', 'evicted', 'landlord wants me out', 'notice to leave', 'section 21', 'section 8', 'kicked out'],
    phraseKey: 'ADVICE_EVICTION_RISK_PREVENTION'
  },
  'sleep_tonight': {
    keywords: ['sleep tonight', 'nowhere to stay', 'emergency accommodation', 'need shelter', 'rough sleep', 'on the street'],
    phraseKey: 'ADVICE_SLEEP_TONIGHT'
  },
  'rent_arrears': {
    keywords: ['rent arrears', 'cant pay rent', 'behind on rent', 'owe rent', 'rent debt', 'struggling with rent'],
    phraseKey: 'ADVICE_RENT_ARREARS_EARLY_HELP_ENGLAND'
  },
  'social_housing': {
    keywords: ['social housing', 'housing register', 'council list', 'housing list', 'apply for council', 'get council housing', 'housing association'],
    phraseKey: 'ADVICE_REGISTER_SOCIAL_HOUSING'
  },
  'rough_sleeping': {
    keywords: ['report rough sleep', 'someone sleeping rough', 'person on street', 'homeless person', 'streetlink'],
    phraseKey: 'ADVICE_REPORT_ROUGH_SLEEPING'
  }
};

// Detect if input is an advice question and match to topic
export async function detectAdviceQuestion(input: string): Promise<string | null> {
  const lowerInput = input.toLowerCase();

  // Quick keyword check first
  for (const [, config] of Object.entries(adviceTopics)) {
    if (config.keywords.some(kw => lowerInput.includes(kw))) {
      return config.phraseKey;
    }
  }

  // If no keyword match but looks like a question, use Claude
  if (input.includes('?') || lowerInput.startsWith('how') || lowerInput.startsWith('what') ||
      lowerInput.startsWith('can i') || lowerInput.startsWith('do i') || lowerInput.startsWith('am i')) {
    try {
      const topicList = Object.entries(adviceTopics).map(([key, config]) =>
        `${key}: ${config.keywords.slice(0, 3).join(', ')}`
      ).join('\n');

      const res = await getClient().messages.create({
        model: getClaudeModel(),
        max_tokens: 64,
        thinking: NO_THINKING,
        system: `You match housing/homelessness questions to advice topics. Reply with ONLY the topic name or "none" if it doesn't match any topic.

Topics:
${topicList}`,
        messages: [{
          role: 'user',
          content: `Question: "${input}"\n\nWhich topic? Reply with just the topic name or "none":`
        }]
      });

      const txt = replyText(res);

      // Find matching topic
      for (const [topic, config] of Object.entries(adviceTopics)) {
        if (txt.includes(topic)) {
          return config.phraseKey;
        }
      }
    } catch (error) {
      logClaudeFailure('advice_topic', error);
    }
  }

  return null;
}

// Check if input is out of scope for housing/homelessness support
export async function checkScope(input: string): Promise<'in_scope' | 'out_of_scope' | 'unclear'> {
  // Quick keyword check for obviously out-of-scope requests
  const outOfScopeKeywords = [
    'recipe', 'recipes', 'cook', 'cooking', 'bake', 'baking',
    'weather', 'forecast',
    'homework', 'math', 'maths', 'equation', 'calculate',
    'joke', 'jokes', 'funny',
    'game', 'games', 'play',
    'movie', 'movies', 'film', 'films', 'tv', 'television',
    'music', 'song', 'songs', 'lyrics',
    'sports', 'football', 'cricket', 'score',
    'code', 'coding', 'programming', 'python', 'javascript',
    'translate', 'translation',
    'write me a', 'write a story', 'write a poem',
    'what is the capital', 'who is the president', 'who won',
  ];

  const lowerInput = input.toLowerCase();

  // Quick check for obvious out-of-scope
  if (outOfScopeKeywords.some(kw => lowerInput.includes(kw))) {
    return 'out_of_scope';
  }

  // If input is very short or looks like a number/option selection, it's in scope
  if (input.length < 3 || /^\d+$/.test(input.trim())) {
    return 'in_scope';
  }

  // For longer inputs at early gates, use Claude to check scope
  try {
    const res = await getClient().messages.create({
      model: getClaudeModel(),
      max_tokens: 64,
      thinking: NO_THINKING,
      system: 'You determine if a user message is related to homelessness, housing, accommodation, eviction, or support services. Reply ONLY with "in_scope" if related, or "out_of_scope" if completely unrelated (like recipes, weather, games, homework, etc.).',
      messages: [{
        role: 'user',
        content: `Is this about housing/homelessness support? "${input}"\n\nReply only: in_scope or out_of_scope`
      }]
    });

    const txt = replyText(res);
    if (txt.includes('out_of_scope')) return 'out_of_scope';
    if (txt.includes('in_scope')) return 'in_scope';
    return 'unclear';
  } catch (error) {
    logClaudeFailure('scope_check', error);
    return 'unclear'; // On error, proceed with flow
  }
}

// Use Claude to interpret ambiguous user input
export async function interpretWithClaude(input: string, options: string[]): Promise<number | null> {
  try {
    const list = options.map((o, i) => `${i + 1}. ${o}`).join('\n');
    const res = await getClient().messages.create({
      model: getClaudeModel(),
      max_tokens: 64,
      thinking: NO_THINKING,
      system: 'You interpret user input for a homelessness support chatbot. Reply with ONLY the number (1, 2, 3, etc.) that best matches, "unclear" if you cannot determine intent, or "out_of_scope" if the request is completely unrelated to housing/homelessness (like recipes, weather, jokes, homework, etc.).',
      messages: [{
        role: 'user',
        content: `The user said: "${input}"\n\nWhich option did they mean?\n${list}\n\nReply with just the number, "unclear", or "out_of_scope":`
      }]
    });

    const txt = replyText(res);
    if (txt === 'unclear' || txt === 'out_of_scope') return null;

    const n = parseInt(txt, 10);
    return (!isNaN(n) && n >= 1 && n <= options.length) ? n : null;
  } catch (error) {
    logClaudeFailure('interpretation', error);
    return null;
  }
}
