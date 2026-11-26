/**
 * Numbers that must never come back. SurvivorsUK's site gives 020 3598 3898
 * only for booking training (read 25 November 2026); its helpline is
 * 0808 801 0332. Checks every file under lib/, so no route can show it.
 */

import { readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';

const RETIRED = ['020 3598 3898'];

function files(dir: string): string[] {
  return readdirSync(dir).flatMap(name => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? files(p) : [p];
  });
}

test.each(RETIRED)('no file under lib/ contains the retired number %s', (n) => {
  const hits = files(join(__dirname, '..', 'lib')).filter(p => readFileSync(p, 'utf8').includes(n));
  expect(hits).toEqual([]);
});
