/**
 * Claude may read typed text on the first question (AI boundaries contract):
 * the Safety screen then asks the person to choose. Whatever Claude picks, the
 * Safety option must land on the type-of-harm question, never straight on an
 * exit (James Cross's review of #69). All inputs are made up for the tests.
 */

const create = jest.fn();
jest.mock('@anthropic-ai/sdk', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({ messages: { create } })),
}));

import { POST } from '../app/api/chat/route';
import { createSession } from '../lib/stateMachine';
import { getPhrase } from '../lib/phrasebank';
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

const atFirstQuestion = (): SessionState => ({
  ...createSession('test'), currentGate: 'B5_MAIN_SUPPORT_NEED', localAuthority: 'Wolverhampton', routeType: 'QUICK',
});

let logSpy: jest.SpyInstance;
beforeEach(() => {
  create.mockReset();
  logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
});
afterEach(() => logSpy.mockRestore());

describe('Claude on the first question never skips the Safety screen', () => {
  const safetyNumber = String((getPhrase('B5_MAIN_SUPPORT_NEED', false)!.options ?? []).indexOf('Staying safe from abuse, exploitation or harm') + 1);

  test.each([
    'someone keeps hurting me and I am scared',
    'my boss took my passport',
    'I need to get away from him tonight',
  ])('Claude picks Safety for "%s": the person lands on the type-of-harm question', async (typed) => {
    create.mockResolvedValue({ content: [{ type: 'text', text: safetyNumber }] });
    const body = await send(typed, atFirstQuestion());
    const s = decode(body.s);
    expect(create).toHaveBeenCalled();
    expect(s.currentGate).toBe('SAFETY_TYPE_OF_HARM');
    expect(body.e).toBeFalsy();
    expect(s.safeguardingTriggered).toBeFalsy();
  });

  test('a typed disclosure Claude cannot place never ends on an exit either', async () => {
    create.mockResolvedValue({ content: [{ type: 'text', text: 'unclear' }] });
    const body = await send('it is not safe at home', atFirstQuestion());
    expect(decode(body.s).currentGate).toBe('B5_MAIN_SUPPORT_NEED');
    expect(body.e).toBeFalsy();
  });
});
