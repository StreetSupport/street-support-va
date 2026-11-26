// The noticing step (Service Matching and Questions Design Note v1.1, 3.5).
//
// After the need, the assistant asks what else is putting pressure on the
// person. It rests only on what the person states: their answer is read as
// option numbers or an option's exact words, never by keyword and never by the
// AI. Wording, the Managing Director, 8 November 2026. Who takes it: Finance,
// Health, Addiction and Employment (3.5; Non-Housing Pathway Endpoints Contract
// 2.2), and Food and Essentials, which run like Food (3.5, 3.7). Dignity
// items (toiletries, period products and emergency clothing; Essentials crib)
// get their results first with no question, then one onward offer (3.7).
//
// Outcomes: "Feeling unsafe" goes to the Safety from harm route (a disclosure,
// 3.6; Safeguarding Contract 3.3 trigger), or to the crisis question while
// the route's switch is off (lib/safetyRouteSwitch.ts). "I don't have a settled place to
// live" and "Keeping my home or paying rent": the results for what they came
// for first, then housing offered as a choice (Managing Director, 19 November
// 2026). A yes leads to the same questions as choosing housing on the first
// question; the housing situation question (VA #40) and the materialisation
// check are not on this branch. Asked once a conversation (Managing
// Director, 19 November 2026).
//
// Not built here, and why:
// - "Not sure where to start" (section 2): the opening and the choice between
//   working it out here or with someone in person have no approved wording.
// - Supporters and professionals: the approved options are in the first
//   person ("how I'm feeling"), and no wording is approved for someone asking
//   on another's behalf. They go straight to results, as before.
// - The awareness line's place-to-start variant: the assistant cannot read the
//   places to start collection yet (design note, work item 20), so the
//   no-place-to-start wording is used everywhere for now.
// - Choosing several pressures by tapping: the chat window sends one option
//   per tap. Several can be typed as numbers ("1 and 3"); a multi-select
//   control in components/ChatWidget.tsx is still to build.

import type { SessionState } from './types';

export type PressureId =
  | 'money' | 'health' | 'relationships' | 'addiction'
  | 'keep-home' | 'no-settled-place' | 'unsafe' | 'nothing-else' | 'not-sure';

// Feeling unsafe first, so it is never missed (Managing Director, 26 November
// 2026, on James Cross's review of #73).
export const PRESSURES: { id: PressureId; label: string }[] = [
  { id: 'unsafe', label: 'Feeling unsafe' },
  { id: 'money', label: 'Money, work or bills' },
  { id: 'health', label: "Health, including how I'm feeling" },
  { id: 'relationships', label: 'Family or relationships' },
  { id: 'addiction', label: 'Drink, drugs or gambling' },
  { id: 'keep-home', label: 'Keeping my home or paying rent' },
  { id: 'no-settled-place', label: "I don't have a settled place to live" },
  { id: 'nothing-else', label: 'Nothing else' },
  { id: 'not-sure', label: "I'm not sure" },
];

export const NOTICING_QUESTION = 'Thanks. Sometimes one thing is tied up with others. Is anything else putting pressure on you at the moment?';
// Multi-select (design paper, Part C, 3.5). Wording: Managing Director,
// 26 November 2026.
export const NOTICING_MORE_THAN_ONE = 'You can choose more than one.';
// The route's existing wording for an answer it could not read.
export const NOTICING_UNCLEAR = "I didn't quite catch that. Please reply with a number from the options.";

// At the noticing question, an unclear answer may be someone typing about
// their safety, which nothing reads until #72's check is built. So the prompt
// points to the safe option and 999, and a second unclear answer shows the
// 999 line above the results (James Cross's review of #73, 24 November 2026).
// The 999 line is the phrasebank's (SAFETY_TYPE_OF_HARM).
export function noticingDangerLine(supporter: boolean): string {
  return supporter ? 'If they are in danger right now, call 999.' : 'If you are in danger right now, call 999.';
}

export function noticingUnclear(supporter: boolean): string {
  const unsafe = supporter ? "If they feel unsafe, choose 'Feeling unsafe'." : "If you feel unsafe, choose 'Feeling unsafe'.";
  return `${NOTICING_UNCLEAR} ${unsafe} ${noticingDangerLine(supporter)}`;
}

// A housing answer: results first, then housing offered as a choice
// (Managing Director, 19 November 2026); the keeping-your-home wording,
// Managing Director, 20 November 2026.
export const HOUSING_OFFER_OPTIONS = ['Look at housing support', 'Stay with these results'];
export function housingOfferText(which: 'no-settled-place' | 'keep-home'): string {
  const said = which === 'no-settled-place' ? "that you don't have a settled place to live" : 'that keeping your home or paying rent is putting pressure on you';
  return `You also mentioned ${said}. Would you like to look at housing support too?`;
}

// Dignity provision: results first, then this offer (design note 3.7).
export const DIGNITY_OFFER = 'If you need somewhere to stay tonight, or other help, I can help with that too.';
const DIGNITY_CHOICES = new Set(['Clothes', 'Toiletries or period products']);

export function isDignityChoice(session: SessionState): boolean {
  return session.v4Option === 'everyday' && DIGNITY_CHOICES.has(session.v4Choice ?? '');
}

const NOTICING_OPTIONS = new Set(['everyday', 'money-work', 'health']);

// What the person came for, as it reads after "help with".
const NEED_WORDS: Record<string, string> = {
  'A hot meal': 'a hot meal',
  'Food to take home': 'food to take home',
  'Clothes': 'clothes',
  'Toiletries or period products': 'toiletries or period products',
  'A phone or getting online': 'a phone or getting online',
  'Debt': 'debt',
  'Benefits': 'benefits',
  'Bills and energy': 'bills and energy',
  'Grants': 'grants',
  'Work or training': 'work or training',
  'Mental health': 'your mental health',
  'Physical health': 'your physical health',
  'Sexual health': 'sexual health',
  'Drugs or alcohol': 'drugs or alcohol',
  'Gambling': 'gambling',
};
const GROUP_WORDS: Record<string, string> = {
  everyday: 'food, clothes or other everyday things',
  'money-work': 'money, debt, benefits or work',
  health: 'health, drugs, alcohol or gambling',
};

export function needWords(session: SessionState): string {
  const choice = session.v4Choice;
  if (choice && NEED_WORDS[choice]) return NEED_WORDS[choice];
  return GROUP_WORDS[session.v4Option ?? ''] ?? 'what you asked about';
}

/** Whether this person is offered the noticing step before their results. */
export function takesNoticingStep(session: SessionState): boolean {
  return NOTICING_OPTIONS.has(session.v4Option ?? '')
    && !isDignityChoice(session)
    && !session.isSupporter
    && !session.noticingAsked;
}

// The pressure already chosen as the need is left out (3.5).
function leftOut(session: SessionState): Set<PressureId> {
  const out = new Set<PressureId>();
  if (session.v4Option === 'money-work') out.add('money');
  if (session.v4Option === 'health') {
    const c = session.v4Choice;
    // Health, including how I'm feeling, is left out only for someone who came
    // about mental health: a physical or sexual health need is not the same need
    // as how someone is feeling (MD, 20 November 2026).
    if (c === 'Drugs or alcohol' || c === 'Gambling') out.add('addiction');
    else if (c === 'Something else' || !c) out.add('addiction');
    else if (c === 'Mental health') out.add('health');
  }
  return out;
}

/** The pressures offered to this person, in order, without the skip. */
export function pressuresFor(session: SessionState): { id: PressureId; label: string }[] {
  const out = leftOut(session);
  return PRESSURES.filter(p => !out.has(p.id));
}

/** The skip, so declining still gets what they came for (3.5; Food, 3.7). */
export function skipLabel(session: SessionState): string {
  const c = session.v4Choice;
  if (c === 'A hot meal' || c === 'Food to take home') return 'Just show me food near me';
  return `Just show me help with ${needWords(session)}`;
}

/** Every option shown, the skip last. */
export function noticingOptions(session: SessionState): string[] {
  return [...pressuresFor(session).map(p => p.label), skipLabel(session)];
}

export function noticingText(session: SessionState): string {
  const opts = noticingOptions(session);
  return `${NOTICING_QUESTION}\n\n${NOTICING_MORE_THAN_ONE}\n\n${opts.map((o, i) => `${i + 1}. ${o}`).join('\n')}`;
}

/**
 * Tells the chat window the question takes several answers. The pressures can
 * be ticked together and sent with Continue; "Nothing else", "I'm not sure"
 * and the skip answer at once (Managing Director, 26 November 2026). These are
 * their option numbers.
 */
export function noticingMultiSelect(session: SessionState): { exclusive: number[] } {
  const exclusive = pressuresFor(session)
    .map((p, i) => (p.id === 'nothing-else' || p.id === 'not-sure' ? i + 1 : 0))
    .filter(n => n > 0);
  return { exclusive: [...exclusive, noticingOptions(session).length] };
}

/**
 * Reads the answer: one or more option numbers ("1", "1 and 3", "1, 3"), or one
 * option's exact words. Anything else, or a number not on the list, is unclear
 * and returns null. Nothing is inferred.
 */
export function parseNoticing(input: string, options: string[]): number[] | null {
  const trimmed = input.trim().replace(/[.!]+$/, '').trim();
  if (trimmed === '') return null;
  const norm = (t: string) => t.toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, ' ').trim();
  const exact = options.findIndex(o => norm(o) === norm(trimmed));
  if (exact >= 0) return [exact + 1];
  const tokens = trimmed.split(/\s*(?:,|\band\b|&|\s)\s*/i).filter(Boolean);
  if (tokens.length === 0 || !tokens.every(t => /^\d+$/.test(t))) return null;
  const nums = [...new Set(tokens.map(Number))];
  if (nums.some(n => n < 1 || n > options.length)) return null;
  return nums.sort((a, b) => a - b);
}

export type NoticingOutcome = 'safety' | 'housing' | 'aware' | 'results';

/**
 * What follows the answer. A safety signal comes first, because it overrides
 * existing state (Safeguarding Contract, as cited in the design note, 3.6).
 * Housing in view comes next: for either housing answer ("I don't have a
 * settled place to live", or keeping a home or paying rent), the results for
 * the original need come first, then housing is offered as a choice, never
 * entered automatically (decision of 19 November). Other pressures named: the
 * awareness line, then their results. Nothing else, not sure, or the skip:
 * their results.
 */
export function noticingOutcome(session: SessionState, picked: number[]): { outcome: NoticingOutcome; named: PressureId[] } {
  const pressures = pressuresFor(session);
  const named = picked.filter(n => n <= pressures.length).map(n => pressures[n - 1].id);
  if (named.includes('unsafe')) return { outcome: 'safety', named };
  if (named.includes('no-settled-place') || named.includes('keep-home')) return { outcome: 'housing', named };
  const real = named.filter(id => id !== 'nothing-else' && id !== 'not-sure');
  return { outcome: real.length > 0 ? 'aware' : 'results', named };
}

/** The awareness line, for an area without a place to start the assistant can offer (3.5). */
export function awarenessLine(session: SessionState): string {
  return `Thanks for telling me. When a few things are pressing at once, they can start to affect each other, including impacting your housing situation. Here's help with ${needWords(session)}. When you speak to them, it's worth mentioning the other things going on, so they can see the wider picture too.`;
}

/**
 * Whether this answer ends in results for the person's need, so the route
 * reads local services only then (never before the Safety or housing route).
 * A second unclear answer also ends in results.
 */
export function noticingLeadsToResults(session: SessionState, input: string): boolean {
  const picked = parseNoticing(input, noticingOptions(session));
  if (!picked) return session.unclearCount >= 1;
  const { outcome } = noticingOutcome(session, picked);
  return outcome !== 'safety';
}

// ------------------------------------------------------------------
// "I'm not sure where to start" (design paper, Part C, section 2): the
// assistant helps the person work it out, through the noticing question, with
// the choice of someone in person at a place to start. Decisions: Managing
// Director, 26 November 2026.
// ------------------------------------------------------------------

export const NOT_SURE_OPENER = "That's OK. Is anything putting pressure on you at the moment?";
export const NOT_SURE_IN_PERSON = "I'd rather talk to someone in person";
// The honest line where no place to start can be offered, and the first
// question again (Managing Director, 8 November 2026). The assistant cannot
// read places to start yet (work item 20), so for now this is always the line.
export const NO_PLACE_TO_START = "There isn't a drop-in near you that we know of. Choosing what's closest from these will help me find the right support.";

/** The pressures, without "Nothing else" and "I'm not sure", then the two that answer alone. */
export function notSureOptions(): string[] {
  const pressures = PRESSURES.filter(p => p.id !== 'nothing-else' && p.id !== 'not-sure').map(p => p.label);
  return [...pressures, NOT_SURE_IN_PERSON, "I'm not sure"];
}

export function notSureText(): string {
  return `${NOT_SURE_OPENER}\n\n${NOTICING_MORE_THAN_ONE}\n\n${notSureOptions().map((o, i) => `${i + 1}. ${o}`).join('\n')}`;
}

export function notSureMultiSelect(): { exclusive: number[] } {
  const n = notSureOptions().length;
  return { exclusive: [n - 1, n] };
}

export type NotSureOutcome =
  | { kind: 'safety' }
  | { kind: 'housing' }
  | { kind: 'topic'; option: 'money-work' | 'health'; others: boolean }
  | { kind: 'in-person' };

// Where each pressure leads on the first question. Family or relationships
// has no topic of its own: alone, it takes the in-person route.
const TOPIC_FOR: Partial<Record<PressureId, 'money-work' | 'health'>> = {
  money: 'money-work',
  health: 'health',
  addiction: 'health',
};

/**
 * Where the answer leads. Feeling unsafe first, then housing, as at the
 * noticing question. Otherwise the first pressure ticked that has a topic,
 * with the awareness line where more than one was ticked. Nothing with a
 * topic, "I'd rather talk to someone in person" or "I'm not sure": the
 * in-person route.
 */
export function notSureOutcome(picked: number[]): NotSureOutcome {
  const pressures = PRESSURES.filter(p => p.id !== 'nothing-else' && p.id !== 'not-sure');
  const named = picked.filter(n => n <= pressures.length).map(n => pressures[n - 1].id);
  if (named.includes('unsafe')) return { kind: 'safety' };
  if (named.includes('no-settled-place') || named.includes('keep-home')) return { kind: 'housing' };
  const first = named.find(id => TOPIC_FOR[id]);
  if (!first) return { kind: 'in-person' };
  return { kind: 'topic', option: TOPIC_FOR[first]!, others: named.length > 1 };
}
