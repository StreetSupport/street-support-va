// The name a person would like to be called (Managing Director, 3 November 2026).
//
// Its purpose is relational: used now and then where it keeps the conversation
// going, so the VA feels less impersonal. It is held in the session only. It is
// never logged, never sent to the Anthropic API and never used in a
// safeguarding exit.

const MAX_LENGTH = 30;
const SKIP_WORDS = new Set(['skip', 'no', 'none', 'n/a', 'na', 'prefer not to say', 'rather not', 'no thanks']);

// Letters (any script), with spaces, apostrophes, hyphens and full stops inside.
const NAME_PATTERN = /^\p{L}[\p{L}\p{M}' .\-’]*$/u;

/**
 * Returns a cleaned name, or null where the answer is a skip or does not look
 * like a name (digits, symbols, a sentence). Null means the VA carries on
 * without a name.
 */
export function cleanPreferredName(input: string | null | undefined): string | null {
  const text = (input ?? '').trim().replace(/\s+/g, ' ');
  if (!text || text.length > MAX_LENGTH) return null;
  if (SKIP_WORDS.has(text.toLowerCase())) return null;
  if (!NAME_PATTERN.test(text)) return null;
  // More than three words reads as a sentence, not a name.
  if (text.split(' ').length > 3) return null;
  return text;
}

/** "Take care, Sam." where a name was given, otherwise the line unchanged. */
export function withNameBeforeFullStop(line: string, name: string | null): string {
  if (!name) return line;
  const firstStop = line.indexOf('.');
  if (firstStop === -1) return line;
  return `${line.slice(0, firstStop)}, ${name}${line.slice(firstStop)}`;
}
