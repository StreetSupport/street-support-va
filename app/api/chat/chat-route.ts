// Street Support VA v7 API Route
// Handles session state and Claude interpretation fallback

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { 
  SessionState, 
  createSession, 
  processInput, 
  getFirstMessage, 
  parseUserInput,
  processLocationInput
} from '@/lib/stateMachine';
import { getPhrase } from '@/lib/phrasebank';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Encode/decode state as base64 for reliable transport
function encodeState(s: SessionState): string {
  return Buffer.from(JSON.stringify(s)).toString('base64');
}

function decodeState(str: string): SessionState | null {
  try {
    return JSON.parse(Buffer.from(str, 'base64').toString('utf8'));
  } catch { 
    return null; 
  }
}

// Advice topics and their keywords for matching
const adviceTopics: Record<string, { keywords: string[]; phraseKey: string }> = {
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
async function detectAdviceQuestion(input: string): Promise<string | null> {
  const lowerInput = input.toLowerCase();
  
  // Quick keyword check first
  for (const [topic, config] of Object.entries(adviceTopics)) {
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
      
      const res = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 30,
        system: `You match housing/homelessness questions to advice topics. Reply with ONLY the topic name or "none" if it doesn't match any topic.

Topics:
${topicList}`,
        messages: [{ 
          role: 'user', 
          content: `Question: "${input}"\n\nWhich topic? Reply with just the topic name or "none":` 
        }]
      });
      
      const txt = res.content[0].type === 'text' ? res.content[0].text.trim().toLowerCase() : '';
      
      // Find matching topic
      for (const [topic, config] of Object.entries(adviceTopics)) {
        if (txt.includes(topic)) {
          return config.phraseKey;
        }
      }
    } catch (error) {
      console.error('Advice detection error:', error);
    }
  }
  
  return null;
}

// Check if input is out of scope for housing/homelessness support
async function checkScope(input: string): Promise<'in_scope' | 'out_of_scope' | 'unclear'> {
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
    const res = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 15,
      system: 'You determine if a user message is related to homelessness, housing, accommodation, eviction, or support services. Reply ONLY with "in_scope" if related, or "out_of_scope" if completely unrelated (like recipes, weather, games, homework, etc.).',
      messages: [{ 
        role: 'user', 
        content: `Is this about housing/homelessness support? "${input}"\n\nReply only: in_scope or out_of_scope` 
      }]
    });
    
    const txt = res.content[0].type === 'text' ? res.content[0].text.trim().toLowerCase() : '';
    if (txt.includes('out_of_scope')) return 'out_of_scope';
    if (txt.includes('in_scope')) return 'in_scope';
    return 'unclear';
  } catch (error) {
    console.error('Scope check error:', error);
    return 'unclear'; // On error, proceed with flow
  }
}

// Use Claude to interpret ambiguous user input
async function interpretWithClaude(input: string, options: string[]): Promise<number | null> {
  try {
    const list = options.map((o, i) => `${i + 1}. ${o}`).join('\n');
    const res = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 15,
      system: 'You interpret user input for a homelessness support chatbot. Reply with ONLY the number (1, 2, 3, etc.) that best matches, "unclear" if you cannot determine intent, or "out_of_scope" if the request is completely unrelated to housing/homelessness (like recipes, weather, jokes, homework, etc.).',
      messages: [{ 
        role: 'user', 
        content: `The user said: "${input}"\n\nWhich option did they mean?\n${list}\n\nReply with just the number, "unclear", or "out_of_scope":` 
      }]
    });
    
    const txt = res.content[0].type === 'text' ? res.content[0].text.trim().toLowerCase() : '';
    if (txt === 'unclear' || txt === 'out_of_scope') return null;
    
    const n = parseInt(txt, 10);
    return (!isNaN(n) && n >= 1 && n <= options.length) ? n : null;
  } catch (error) {
    console.error('Claude interpretation error:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message = body.message || '';
    const encodedState = body.s || '';
    const locationData = body.locationData; // Location result from widget
    
    // Decode or create session
    let session: SessionState = decodeState(encodedState) || createSession(crypto.randomUUID());
    
    console.log(`[VA] Gate: ${session.currentGate}, Input: "${message.substring(0, 50)}..."`);
    
    // INIT -> return first message (crisis gate)
    if (session.currentGate === 'INIT') {
      const result = getFirstMessage(session);
      session = { ...session, ...result.stateUpdates };
      
      return NextResponse.json({
        s: encodeState(session),
        m: result.text,
        o: result.options,
        e: false
      });
    }
    
    // Handle location result from widget
    if (message === '__LOCATION_RESULT__' && locationData) {
      console.log(`[VA] Location result:`, locationData);
      
      const result = processLocationInput(session, locationData);
      session = { ...session, ...result.stateUpdates };
      
      return NextResponse.json({
        s: encodeState(session),
        m: result.text,
        o: result.options,
        e: result.sessionEnded,
        responseType: result.responseType
      });
    }
    
    // Get current phrase for option parsing
    const currentPhrase = getPhrase(session.currentGate, session.isSupporter);
    
    // Check for out-of-scope requests at early gates
    const earlyGates = ['GATE0_CRISIS_DANGER', 'GATE1_INTENT', 'B4_ADVICE_TOPIC_SELECTION', 'ADVICE_BRIDGE'];
    if (earlyGates.includes(session.currentGate) && message.length > 5 && !/^\d+$/.test(message.trim())) {
      const scope = await checkScope(message);
      if (scope === 'out_of_scope') {
        const outOfScope = getPhrase('OUT_OF_SCOPE_GENERAL', session.isSupporter);
        return NextResponse.json({
          s: encodeState(session),
          m: outOfScope?.text || 'I\'m here to help with housing and homelessness support. Is there something related to that I can help you with?',
          o: currentPhrase?.options,
          e: false
        });
      }
      
      // Check for advice questions (tangent handling)
      const advicePhraseKey = await detectAdviceQuestion(message);
      if (advicePhraseKey) {
        console.log(`[VA] Advice tangent detected: ${advicePhraseKey}`);
        const adviceContent = getPhrase(advicePhraseKey, session.isSupporter);
        const adviceBridge = getPhrase('ADVICE_BRIDGE', session.isSupporter);
        
        if (adviceContent) {
          // Set gate to ADVICE_BRIDGE so next response is handled correctly
          session.currentGate = 'ADVICE_BRIDGE';
          
          // Return advice content with bridge options
          return NextResponse.json({
            s: encodeState(session),
            m: `${adviceContent.text}\n\n---\n\n${adviceBridge?.text || 'Is there anything else I can help with?'}`,
            o: adviceBridge?.options || ['Connect me to support services', 'I have another question', 'That\'s all I needed, thanks'],
            e: false
          });
        }
      }
    }
    
    // Try to parse user input
    let parsed = parseUserInput(message, currentPhrase?.options);
    
    // If parsing failed and we have options, try Claude interpretation
    if (parsed === null && currentPhrase?.options) {
      parsed = await interpretWithClaude(message, currentPhrase.options);
    }
    
    // If still unclear, handle escalation
    if (parsed === null) {
      session.unclearCount++;
      
      // Level 1 escalation at 2 unclear
      if (session.unclearCount === 2) {
        const level1 = getPhrase('ESCALATION_LEVEL_1_BRIDGE', session.isSupporter);
        return NextResponse.json({
          s: encodeState(session),
          m: level1?.text || 'I\'m having trouble understanding. Could you try again?',
          o: level1?.options,
          e: false
        });
      }
      
      // Level 2 escalation at 3+ unclear
      if (session.unclearCount >= 3) {
        const level2 = getPhrase('ESCALATION_LEVEL_2_INTERVENTION', session.isSupporter);
        session.escalationLevel = 2;
        session.currentGate = 'ESCALATION_LEVEL_2';
        
        return NextResponse.json({
          s: encodeState(session),
          m: level2?.text || 'This doesn\'t seem to be working. Let me help another way.',
          o: level2?.options,
          e: false
        });
      }
      
      // Simple retry
      return NextResponse.json({
        s: encodeState(session),
        m: `I didn't quite catch that. Please reply with a number from the options.\n\n${currentPhrase?.text || ''}`,
        o: currentPhrase?.options,
        e: false
      });
    }
    
    // Reset unclear count on successful parse
    session.unclearCount = 0;
    
    // Process the input through state machine
    const result = processInput(session, String(parsed));
    session = { ...session, ...result.stateUpdates };
    
    console.log(`[VA] -> Next gate: ${session.currentGate}, Ended: ${result.sessionEnded}`);
    
    // Log session end for analytics
    if (result.sessionEnded) {
      console.log('[VA] SESSION END:', JSON.stringify({
        id: session.sessionId,
        la: session.localAuthority,
        userType: session.userType,
        age: session.ageCategory,
        need: session.supportNeed,
        homeless: session.homeless,
        safeguarding: session.safeguardingType,
        escalation: session.escalationLevel,
        duration: session.duration,
        routeType: session.routeType
      }));
    }
    
    return NextResponse.json({
      s: encodeState(session),
      m: result.text,
      o: result.options,
      e: result.sessionEnded,
      responseType: result.responseType
    });
    
  } catch (error) {
    console.error('[VA] Error:', error);
    
    // Graceful fallback
    return NextResponse.json({ 
      m: `Something went wrong. Please contact Shelter directly:

Shelter Emergency Helpline
0808 800 4444 (free, 8am-8pm weekdays, 9am-5pm weekends)
https://england.shelter.org.uk`, 
      e: true 
    }, { status: 500 });
  }
}
