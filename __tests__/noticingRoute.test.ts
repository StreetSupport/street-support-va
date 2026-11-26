/**
 * The noticing question through the chat route (James Cross's review of #73).
 * Two unclear answers must reach results, so no one is held on the question,
 * and the under-16 check must run first. All inputs are made up for the tests.
 */

process.env.ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY ?? 'test-key-not-used';

import { POST } from '../app/api/chat/route';
import { createSession, processInput } from '../lib/stateMachine';
import type { SessionState } from '../lib/types';

type Body = { s: string; m?: string; o?: string[]; e?: boolean };

const encode = (s: SessionState) => Buffer.from(JSON.stringify(s)).toString('base64');
const decode = (s: string) => JSON.parse(Buffer.from(s, 'base64').toString('utf8')) as SessionState;

async function send(message: string, session: SessionState): Promise<Body> {
  const req = new Request('http://localhost/api/chat', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ message, s: encode(session) }),
  });
  const res = await POST(req as unknown as Parameters<typeof POST>[0]);
  return (await res.json()) as Body;
}

function atNoticing(): SessionState {
  let s: SessionState = { ...createSession('test'), currentGate: 'B5_MAIN_SUPPORT_NEED', localAuthority: 'Wolverhampton', routeType: 'QUICK' };
  for (const input of ['3', '1']) s = { ...s, ...processInput(s, input).stateUpdates };
  for (let i = 0; i < 10 && s.currentGate !== 'B5_NOTICING'; i++) {
    s = { ...s, ...processInput(s, s.currentGate === 'B5_PROFILE_AGE' ? '4' : '2').stateUpdates };
  }
  expect(s.currentGate).toBe('B5_NOTICING');
  return s;
}

let logSpy: jest.SpyInstance;
beforeEach(() => { logSpy = jest.spyOn(console, 'log').mockImplementation(() => {}); });
afterEach(() => logSpy.mockRestore());

describe('Noticing question through the route', () => {
  test('a first unclear answer asks again; a second reaches results', async () => {
    const first = await send('hard to put into words', atNoticing());
    expect(decode(first.s).currentGate).toBe('B5_NOTICING');
    const second = await send('still hard to say', decode(first.s));
    const s = decode(second.s);
    expect(s.currentGate).not.toBe('B5_NOTICING');
    expect(s.unclearCount).toBe(0);
  });

  test('a typed under-16 age at the noticing question triggers the under-16 exit first', async () => {
    const body = await send("I'm 14 and things are hard at home", atNoticing());
    const s = decode(body.s);
    expect(s.safeguardingTriggered).toBe(true);
    expect(s.safeguardingType).toBe('UNDER_16');
    expect(s.currentGate).not.toBe('B5_NOTICING');
  });
});

describe('Noticing question through the route: more than one answer', () => {
  test('the route passes the multi-select signal to the chat window', async () => {
    let s: SessionState = { ...createSession('test'), currentGate: 'B5_MAIN_SUPPORT_NEED', localAuthority: 'Wolverhampton', routeType: 'QUICK' };
    s = { ...s, ...processInput(s, '3').stateUpdates };
    const body = await send('1', s) as Body & { ms?: { exclusive: number[] } };
    expect(decode(body.s).currentGate).toBe('B5_NOTICING');
    expect(body.ms?.exclusive.length).toBe(3);
  });

  test('two ticked pressures, sent together, are both read', async () => {
    const at = atNoticing();
    const body = await send('2, 4', at);
    const s = decode(body.s);
    expect(s.currentGate).not.toBe('B5_NOTICING');
    expect(s.unclearCount).toBe(0);
  });
});
