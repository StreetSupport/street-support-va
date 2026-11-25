/**
 * 999 when someone can't speak (James Cross's review of #69). The IOPC's
 * "Make Yourself Heard" guidance: call 999, listen, cough or tap if you can,
 * and on a mobile press 55 only when the recorded message asks.
 */

import { phrasebank, getPhrase } from '../lib/phrasebank';

describe('Silent Solution wording', () => {
  test('nothing tells someone to press 55 straight away', () => {
    for (const [key, entry] of Object.entries(phrasebank)) {
      expect({ key, bad: /then press 55|and press 55\b/i.test(entry.text) }).toEqual({ key, bad: false });
    }
  });

  test.each([[false], [true]])('the immediate danger exit says to press 55 when asked, on a mobile (supporter: %s)', (supporter) => {
    const t = getPhrase('IMMEDIATE_PHYSICAL_DANGER_EXIT', supporter)!.text;
    expect(t).toMatch(/cough or tap/i);
    expect(t).toMatch(/On a mobile, press 55 when a recorded message asks/);
  });
});
