// The name a person would like to be called (Managing Director, 3 November 2026).
//
// Its purpose is relational: used now and then where it keeps the conversation
// going, so the VA feels less impersonal. It is held in the session only. It is
// never logged, never sent to the Anthropic API and never used in a
// safeguarding exit.

const MAX_LENGTH = 30;
const SKIP_WORDS = new Set(['skip', 'no', 'none', 'n/a', 'na', 'prefer not to say', 'rather not', 'no thanks']);

// Words that are never a name on their own: pronouns and short replies, and
// words of distress. The crisis gate is where disclosures are handled; this
// list only stops the VA echoing someone's words back as if they were a name
// (technical lead's review of #38, 10 November 2026). A missed name just means
// the VA carries on without one, which is the safe direction.
const NON_NAME_WORDS = new Set([
  'i', "i'm", 'im', 'me', 'my', 'myself', 'no', 'not', 'nobody', 'none', 'yes',
  'hi', 'hello', 'hey', 'idk', 'dont', "don't", 'know', 'whatever', 'sure',
  'thanks', 'please',
  'help', 'hurt', 'hurting', 'kill', 'die', 'dead', 'scared', 'afraid', 'unsafe',
  'alone', 'homeless', 'need',
]);

// Letters (any script), with spaces, apostrophes, hyphens and full stops inside.
const NAME_PATTERN = /^\p{L}[\p{L}\p{M}' .\-’]*$/u;

/**
 * Returns a cleaned name, or null where the answer is a skip or does not look
 * plainly like a name (digits, symbols, more than two words, or a word that is
 * never a name). Null means the VA carries on without a name.
 */
export function cleanPreferredName(input: string | null | undefined): string | null {
  const text = (input ?? '').trim().replace(/\s+/g, ' ');
  if (!text || text.length > MAX_LENGTH) return null;
  if (SKIP_WORDS.has(text.toLowerCase())) return null;
  if (!NAME_PATTERN.test(text)) return null;
  const words = text.split(' ');
  // A name is one or two words (Jo Ann, Mr Ahmed). More reads as a sentence.
  if (words.length > 2) return null;
  if (words.some((w) => NON_NAME_WORDS.has(w.toLowerCase().replace(/’/g, "'")))) return null;
  return text;
}

/** "Take care, Sam." where a name was given, otherwise the line unchanged. */
export function withNameBeforeFullStop(line: string, name: string | null): string {
  if (!name) return line;
  const firstStop = line.indexOf('.');
  if (firstStop === -1) return line;
  return `${line.slice(0, firstStop)}, ${name}${line.slice(firstStop)}`;
}
