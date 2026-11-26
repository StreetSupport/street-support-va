// Children's services contacts on the under-16 exit, checked at the councils'
// own sources on 19 November 2026: Solihull's safeguarding page gives
// 0121 605 6060 for evenings, weekends and bank holidays; Walsall's children's
// services procedures give 0300 555 2922 as the Emergency Duty Team line.

import type { SessionState } from '../lib/types';
import { createSession } from '../lib/stateMachine';
import { buildUnder16Exit } from '../lib/handlers/shared';

function exitFor(la: string): string {
  const s: SessionState = { ...createSession('test'), localAuthority: la };
  return buildUnder16Exit(s).text;
}

describe('Under-16 exit: someone needing children\'s services after hours', () => {
  test('a young person in Solihull is given the out-of-hours line alongside the daytime one', () => {
    const t = exitFor('Solihull');
    expect(t).toContain('0121 788 4300 (out of hours: 0121 605 6060)');
  });

  test('a young person in Walsall is given the Emergency Duty Team line alongside the daytime one', () => {
    const t = exitFor('Walsall');
    expect(t).toContain('0300 555 2866 (out of hours: 0300 555 2922)');
  });

  test('every West Midlands borough now gives an out-of-hours line on the under-16 exit', () => {
    const missing = ['Birmingham', 'Coventry', 'Dudley', 'Sandwell', 'Solihull', 'Walsall', 'Wolverhampton']
      .filter(la => !exitFor(la).includes('out of hours:'));
    expect(missing).toEqual([]);
  });
});
