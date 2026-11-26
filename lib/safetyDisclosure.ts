/**
 * Safety disclosure check (Safety Disclosure Check Design Note v1.0, #72).
 *
 * Fixed patterns only: no AI reads the message or the answer (note section 5).
 * First person only (section 4). The trigger list is Appendix A, approved by the
 * Managing Director, 19 November 2026, pending the technical lead's review.
 * Nothing about the check is logged or kept beyond the conversation's own state
 * (section 7).
 *
 * How a line matches (Appendix A, rules 1 to 8):
 * 1. Whole words, ignoring case.
 * 2. Text forms count the same: "I'm", "Im" and "I am"; "don't" and "dont".
 *    Messages are put into one form first (normalise), so each line is written
 *    once, in full words.
 * 3. A sentence ends at . ? ! or a line break.
 * 4. A line's parts appear in order in one sentence, with at most four other
 *    words between each, except where a line says otherwise. Where a line's own table entry is a fixed phrase
 *    ("I'm in danger"), it is one part, so nothing comes between its words;
 *    "I" and what follows allow one word between ("I'm really scared to go home").
 * 5. Doers: SOMEONE_CLOSE and ANYONE below.
 * 6. Negation directly before a line's act stops it. A negation inside the
 *    line's own wording ("will not let me") is part of the match.
 * 7. Messages beginning "what is", "what does", "where is", "where can I",
 *    "how do I find" or "is there a" never match.
 * 8. Sentences beginning "what if" or "if someone" never match.
 *
 * Changes require safeguarding test coverage: every line has tests in both
 * directions in __tests__/safetyDisclosure.test.ts.
 */

export type DisclosureFamily = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';

// ------------------------------------------------------------------
// Rule 2: one written form
// ------------------------------------------------------------------

// Apostrophe-less forms people type, and their full words.
const TEXT_FORMS: Record<string, string> = {
  im: 'i am', ive: 'i have',
  dont: 'do not', doesnt: 'does not', didnt: 'did not', hasnt: 'has not', havent: 'have not',
  wont: 'will not', cant: 'can not', cannot: 'can not', isnt: 'is not', arent: 'are not',
  wasnt: 'was not', werent: 'were not', wouldnt: 'would not', shouldnt: 'should not',
  theyll: 'they will', theyre: 'they are', theyve: 'they have', whats: 'what is',
  gonna: 'going to', wanna: 'want to',
  // Misspellings (UNICEF Safer Chatbots, p.05: "forsd" for "forced")
  forsd: 'forced', threatend: 'threatened', thretened: 'threatened', threatned: 'threatened',
  honor: 'honour',
};

export function normalise(text: string): string {
  let t = text.toLowerCase().replace(/[‘’ʼ`]/g, "'");
  // Contractions written with an apostrophe
  t = t
    .replace(/\bwon't\b/g, 'will not')
    .replace(/\bcan't\b/g, 'can not')
    .replace(/\bshan't\b/g, 'shall not')
    .replace(/n't\b/g, ' not')
    .replace(/\bi'm\b/g, 'i am')
    .replace(/'ll\b/g, ' will')
    .replace(/'re\b/g, ' are')
    .replace(/'ve\b/g, ' have')
    .replace(/'d\b/g, ' would')
    .replace(/'s\b/g, 's') // "what's" -> "whats", "it's" -> "its"
    .replace(/'/g, '');
  // Hyphens join words: "honour-based" -> "honour based", "in-laws" -> "in laws"
  t = t.replace(/-/g, ' ');
  return t;
}

// Rule 3: sentences, each a list of words in their full form.
export function sentences(text: string): string[][] {
  return normalise(text)
    .split(/[.?!\n\r]+/)
    .map(s => s.split(/[^a-z0-9]+/).filter(Boolean).flatMap(w => (TEXT_FORMS[w] ?? w).split(' ')))
    .filter(s => s.length > 0);
}

// ------------------------------------------------------------------
// Rule 5: doers
// ------------------------------------------------------------------

export const SOMEONE_CLOSE = [
  'he', 'she', 'they', 'partner', 'husband', 'wife', 'boyfriend', 'girlfriend', 'ex', 'dad', 'father',
  'mum', 'mother', 'stepdad', 'step dad', 'stepmum', 'step mum', 'brother', 'sister', 'son', 'daughter',
  'cousin', 'uncle', 'aunt', 'in laws', 'mother in law', 'father in law', 'family', 'carer', 'landlord',
  'boss', 'employer',
];

export const ANYONE = [
  ...SOMEONE_CLOSE,
  'someone', 'somebody', 'a man', 'a woman', 'a stranger', 'a group', 'people', 'the people i owe',
];

// ------------------------------------------------------------------
// Lines
// ------------------------------------------------------------------

interface Part {
  any: string[];        // alternatives, each in full words
  gap?: number;         // most words allowed before this part (default 4)
  act?: boolean;        // rule 6: negation directly before this part stops the line
  notFollowedBy?: string[]; // words that, straight after this part, stop the line
}

export interface Line {
  family: DisclosureFamily;
  parts: Part[];
}

const I_AM = ['i am'];
const I_WAS = ['i was', 'i have been', 'i am'];
const near = 1; // "I" and what follows: one word between, such as "really"

const ME_WITH_BILLS = ['with a sanction', 'with a bill', 'with bills', 'with arrears', 'with a fine', 'with a charge'];
const ME_WITH_EVICTION = ['with eviction', 'with court', 'with bailiffs', 'with a section 21', 'with a sanction'];

const FGM_TERMS = [
  'thara', 'khitan', 'khifad', 'megrez', 'absum', 'mekhnishab', 'kutairi', 'ibi', 'ugwu', 'sunna', 'bondo',
  'sonde', 'gudiniin', 'halalays', 'qodiin', 'tahoor', 'bagne', 'gadja', 'fanadu di mindjer', 'niaka',
  'kuyango', 'musolula karoola',
];

const WANT_TO = ['want', 'wants', 'going', 'plan', 'plans', 'planning'];

export const LINES: Line[] = [
  // A. Feeling unsafe or in danger
  { family: 'A', parts: [{ any: ['i'] }, { any: ['do not feel safe', 'feel unsafe'], gap: near, act: true }] },
  { family: 'A', parts: [{ any: I_AM }, { any: ['not safe', 'unsafe'], gap: near, act: true }] },
  { family: 'A', parts: [{ any: I_AM }, { any: ['scared to go home', 'afraid to go home', 'frightened to go home',
    'scared to go back home', 'afraid to go back home', 'frightened to go back home'], gap: near, act: true }] },
  { family: 'A', parts: [{ any: I_AM }, { any: ['scared of', 'afraid of', 'frightened of'], gap: near, act: true },
    { any: SOMEONE_CLOSE, gap: 1 }] },
  { family: 'A', parts: [{ any: I_AM }, { any: ['in danger'], gap: near, act: true, notFollowedBy: ['of'] }] },
  { family: 'A', parts: [{ any: ['my life is in danger', 'i fear for my life'] }] },

  // B. Someone hurting, threatening or controlling me
  { family: 'B', parts: [{ any: SOMEONE_CLOSE },
    { any: ['hits', 'hit', 'beats', 'beat', 'punches', 'punched', 'slaps', 'slapped',
      'hurts', 'hurt', 'strangled', 'strangles', 'choked', 'chokes'], act: true },
    { any: ['me'], notFollowedBy: ME_WITH_BILLS }] },
  // "kicked me out" is being made to leave, not harm (Managing Director,
  // 26 November 2026)
  { family: 'B', parts: [{ any: SOMEONE_CLOSE }, { any: ['kicks', 'kicked'], act: true },
    { any: ['me'], notFollowedBy: ['out'] }] },
  { family: 'B', parts: [{ any: SOMEONE_CLOSE }, { any: ['pushed'], act: true }, { any: ['me'] }] },
  // "me" or "to hurt ..." straight after, as the table lists them, so
  // "threatened to evict me" does not trigger (Managing Director, 26 November 2026)
  { family: 'B', parts: [{ any: SOMEONE_CLOSE }, { any: ['threatens', 'threatened'], act: true },
    { any: ['me', 'to hurt me', 'to hurt my kids', 'to hurt my children', 'to hurt my pet', 'to hurt my dog'],
      gap: 0, notFollowedBy: ME_WITH_EVICTION }] },
  { family: 'B', parts: [{ any: SOMEONE_CLOSE },
    { any: ['will not let me', 'does not let me', 'do not let me', 'will not allow me'], act: true },
    { any: ['leave', 'go out', 'see my friends', 'see my family', 'have money', 'have my phone'], gap: 0 }] },
  { family: 'B', parts: [{ any: SOMEONE_CLOSE },
    { any: ['controls my money', 'checks my phone', 'tracks my phone', 'reads my messages'], act: true }] },
  { family: 'B', parts: [{ any: I_AM }, { any: ['being abused', 'being hit', 'being beaten', 'being controlled',
    'being stalked', 'in an abusive relationship', 'experiencing domestic abuse', 'experiencing domestic violence',
    'experiencing coercive control', 'experiencing economic abuse'], gap: near, act: true }] },

  // C. Forced marriage and honour
  { family: 'C', parts: [{ any: ANYONE }, { any: ['making', 'forcing', 'forced', 'force', 'forces'], act: true },
    { any: ['me marry', 'me to marry', 'me get married', 'me to get married', 'me into marriage', 'me into a marriage'], gap: 0 }] },
  { family: 'C', parts: [{ any: I_WAS }, { any: ['being forced to marry', 'being forced into marriage',
    'being forced to get married', 'forced to marry', 'forced into marriage', 'forced into a marriage'], gap: near, act: true }] },
  { family: 'C', parts: [{ any: ANYONE }, { any: ['want', 'wants'], act: true },
    { any: ['me to marry someone i do not want'], gap: 0 }] },
  { family: 'C', parts: [{ any: ANYONE }, { any: ['threatening', 'threatened', 'going', 'threatens'], act: true },
    { any: ['to take me abroad to marry', 'to take me abroad to get married'], gap: 0 }] },
  { family: 'C', parts: [{ any: I_AM }, { any: ['experiencing honour based abuse', 'experiencing honour based violence'], gap: near, act: true }] },
  { family: 'C', parts: [{ any: ANYONE }, { any: ['will kill me if i do not marry', 'will kill me if i do not get married'], act: true }] },

  // D. FGM
  { family: 'D', parts: [{ any: ANYONE }, { any: WANT_TO, act: true }, { any: ['to cut me'], gap: 0, notFollowedBy: ['off'] }] },
  { family: 'D', parts: [{ any: ['taking me abroad to be cut'] }] },
  { family: 'D', parts: [{ any: ['i was'] }, { any: ['cut as a girl', 'cut as a child'], gap: near }] },
  { family: 'D', parts: [{ any: ['i have had fgm', 'i had fgm'] }] },
  { family: 'D', parts: [{ any: FGM_TERMS.map(t => `i had ${t}`).concat(FGM_TERMS.map(t => `i have had ${t}`),
    FGM_TERMS.map(t => `taking me abroad for ${t}`)) }] },
  { family: 'D', parts: [{ any: ANYONE }, { any: WANT_TO, act: true }, { any: FGM_TERMS.map(t => `to do ${t} to me`), gap: 0 }] },

  // E. Sexual violence
  { family: 'E', parts: [{ any: ['i was raped', 'i have been raped'] }] },
  { family: 'E', parts: [{ any: ANYONE }, { any: ['raped'], act: true }, { any: ['me'] }] },
  { family: 'E', parts: [{ any: ['i was', 'i have been'] }, { any: ['sexually assaulted', 'sexually abused'], gap: near, act: true }] },
  { family: 'E', parts: [{ any: ANYONE }, { any: ['sexually assaulted', 'sexually abused'], act: true }, { any: ['me'] }] },
  { family: 'E', parts: [{ any: ['i was violated', 'i have been violated'] }] },
  { family: 'E', parts: [{ any: ANYONE }, { any: ['forced', 'made'], act: true }, { any: ['me have sex', 'me to have sex'], gap: 0 }] },
  { family: 'E', parts: [{ any: ANYONE }, { any: ['touched'], act: true }, { any: ['me when i said no', 'me without my consent'] }] },

  // F. Exploitation and modern slavery
  { family: 'F', parts: [{ any: SOMEONE_CLOSE }, { any: ['took', 'takes', 'take', 'has', 'have', 'keeps', 'keep', 'kept'], act: true },
    { any: ['my passport', 'my documents', 'my id', 'my papers', 'my phone'], gap: 0, notFollowedBy: ['number'] }] },
  { family: 'F', parts: [{ any: ANYONE }, { any: ['forced', 'made', 'make', 'makes', 'force', 'forces'], act: true },
    { any: ['me work for nothing', 'me work for no money', 'me work for free', 'me work for them',
      'me to work for nothing', 'me to work for no money', 'me to work for free', 'me to work for them'], gap: 0 }] },
  { family: 'F', parts: [{ any: I_AM }, { any: ['made to work for nothing', 'made to work for no money', 'made to work for free',
    'forced to work for nothing', 'forced to work for no money', 'forced to work for free'], gap: near, act: true }] },
  { family: 'F', parts: [{ any: ANYONE }, { any: ['takes', 'take', 'took', 'keeps', 'keep', 'kept'], act: true },
    { any: ['my wages', 'my pay'], gap: 0 }] },
  { family: 'F', parts: [{ any: SOMEONE_CLOSE }, { any: ['will not let me', 'does not let me', 'do not let me', 'will not allow me'], act: true },
    { any: ['leave the house', 'leave where i work', 'leave where i live'], gap: 0 }] },
  { family: 'F', parts: [{ any: I_AM }, { any: ['locked in'], gap: near, act: true }] },
  { family: 'F', parts: [{ any: ANYONE }, { any: ['keep', 'keeps', 'kept'], act: true }, { any: ['me in the house'], gap: 0 }] },
  { family: 'F', parts: [{ any: ['i have to work to pay off a debt to them', 'i have to work to pay off my debt to them',
    'i have to work to pay off what i owe them'] }] },
  { family: 'F', parts: [{ any: I_AM }, { any: ['working to pay off a debt to them', 'working to pay off my debt to them',
    'working to pay off what i owe them'], gap: near, act: true }] },
  { family: 'F', parts: [{ any: ANYONE }, { any: ['make', 'makes', 'made'], act: true },
    { any: ['me work to pay what i owe', 'me work to pay off what i owe', 'me work to pay off my debt',
      'me work to pay off a debt'], gap: 0 }] },

  // G. Threats to life (idioms such as "my boss will kill me" trigger: Managing
  // Director, 19 November 2026)
  { family: 'G', parts: [{ any: ANYONE }, { any: ['said', 'says', 'threatened', 'threatens'], act: true },
    { any: ['to kill me', 'he will kill me', 'she will kill me', 'they will kill me', 'he would kill me',
      'she would kill me', 'they would kill me'], gap: 0 }] },
  { family: 'G', parts: [{ any: ANYONE }, { any: ['is going to kill me', 'are going to kill me', 'will kill me', 'would kill me'], act: true }] },
];

// ------------------------------------------------------------------
// Matching
// ------------------------------------------------------------------

const QUESTION_OPENERS = [
  ['what', 'is'], ['what', 'does'], ['where', 'is'], ['where', 'can', 'i'], ['how', 'do', 'i', 'find'], ['is', 'there', 'a'],
];
const HYPOTHETICAL_OPENERS = [['what', 'if'], ['if', 'someone']];

function startsWith(words: string[], prefix: string[]): boolean {
  return prefix.every((w, i) => words[i] === w);
}

function phraseAt(words: string[], at: number, phrase: string[]): boolean {
  return at + phrase.length <= words.length && phrase.every((w, i) => words[at + i] === w);
}

function negatedBefore(words: string[], at: number): boolean {
  const before = words[at - 1];
  if (before === 'not' || before === 'never') return true;
  return words[at - 2] === 'no' && before === 'longer';
}

// Tries every placing of the line's parts, in order, from `from`.
function matchParts(words: string[], parts: Part[], index: number, from: number, first: boolean): boolean {
  if (index === parts.length) return true;
  const part = parts[index];
  const gap = first ? Infinity : (part.gap ?? 4);
  const last = Math.min(words.length - 1, from + gap);
  for (let at = from; at <= last; at++) {
    for (const alt of part.any) {
      const phrase = alt.split(' ');
      if (!phraseAt(words, at, phrase)) continue;
      if (part.act && negatedBefore(words, at)) continue;
      const end = at + phrase.length;
      if (part.notFollowedBy?.some(n => phraseAt(words, end, n.split(' ')))) continue;
      if (matchParts(words, parts, index + 1, end, false)) return true;
    }
  }
  return false;
}

export function lineMatches(line: Line, words: string[]): boolean {
  return matchParts(words, line.parts, 0, 0, true);
}

/** The families a message matches, in order. Empty when it matches none. */
export function detectDisclosure(message: string): DisclosureFamily[] {
  const all = sentences(message);
  if (all.length === 0) return [];
  // Rule 7: questions about words or services
  if (QUESTION_OPENERS.some(q => startsWith(all[0], q))) return [];
  const found = new Set<DisclosureFamily>();
  for (const words of all) {
    // Rule 8: hypotheticals
    if (HYPOTHETICAL_OPENERS.some(h => startsWith(words, h))) continue;
    for (const line of LINES) {
      if (!found.has(line.family) && lineMatches(line, words)) found.add(line.family);
    }
  }
  return (['A', 'B', 'C', 'D', 'E', 'F', 'G'] as DisclosureFamily[]).filter(f => found.has(f));
}

// ------------------------------------------------------------------
// The clarifying question's answer (note section 3): read strictly, by code only
// ------------------------------------------------------------------

export const DISCLOSURE_YES = ['yes', 'y', 'yeah', 'yep', 'yes please', 'ok', 'okay', 'please'];
export const DISCLOSURE_NO = ['no', 'n', 'nope', 'no thanks', 'no thank you', 'carry on'];

export function readDisclosureAnswer(message: string, options: string[]): 'yes' | 'no' | 'unclear' {
  const plain = message.trim().toLowerCase().replace(/[‘’]/g, "'").replace(/[.!,]+$/, '').trim();
  if (plain === '1' || plain === options[0]?.toLowerCase()) return 'yes';
  if (plain === '2' || plain === options[1]?.toLowerCase()) return 'no';
  if (DISCLOSURE_YES.includes(plain)) return 'yes';
  if (DISCLOSURE_NO.includes(plain)) return 'no';
  // An explicit statement, in any family, is itself the confirmation
  if (detectDisclosure(message).length > 0) return 'yes';
  return 'unclear';
}
