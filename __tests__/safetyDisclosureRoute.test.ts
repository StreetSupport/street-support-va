/**
 * Safety disclosure check through the chat route: the journeys of the design
 * note, section 9. All inputs are made up for the tests.
 */

process.env.ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY ?? 'test-key-not-used';

import { POST } from '../app/api/chat/route';
import { createSession, secondScreenPhraseKey } from '../lib/stateMachine';
import { setClaudeClientForTests, type ClaudeClient } from '../lib/claudeClassifiers';
import { getPhrase, phrasebank } from '../lib/phrasebank';
import { detectDisclosure } from '../lib/safetyDisclosure';
import { SAFETY_CHECK_EXCLUDED_GATES, interceptSafetyDisclosure, questionAgain } from '../lib/handlers/safetyDisclosureCheck';
import type { GateType, SessionState } from '../lib/types';

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

// At the age question, with the area known and an earlier answer given.
function atAge(extra: Partial<SessionState> = {}): SessionState {
  return { ...createSession('test'), currentGate: 'B5_PROFILE_AGE', localAuthority: 'Wolverhampton', routeType: 'QUICK', supportNeed: 'V4:food', ...extra };
}

const QUESTION = getPhrase('SAFETY_DISCLOSURE_CHECK', false)!;

let create: jest.Mock;
let logSpy: jest.SpyInstance;
const savedSwitch = process.env.VA_SAFETY_ROUTE;
beforeEach(() => {
  logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  create = jest.fn(() => Promise.reject(new Error('the AI is not called in these tests')));
  setClaudeClientForTests({ messages: { create } } as unknown as ClaudeClient);
  process.env.VA_SAFETY_ROUTE = 'on';
});
afterEach(() => {
  logSpy.mockRestore();
  if (savedSwitch === undefined) delete process.env.VA_SAFETY_ROUTE; else process.env.VA_SAFETY_ROUTE = savedSwitch;
});

describe('the clarifying question', () => {
  test('a statement at any step asks the question, with 999 first and the quick exit note after', async () => {
    const body = await send('my partner hits me', atAge());
    expect(body.m).toBe(QUESTION.text);
    expect(body.m!.startsWith("If you're in immediate danger, call 999.")).toBe(true);
    expect(body.m).toContain('Exit this page');
    expect(body.o).toEqual(['Yes, show me help with staying safe', 'No, carry on']);
    expect(decode(body.s).currentGate).toBe('SAFETY_DISCLOSURE_CHECK');
  });

  test.each(['Yes', 'yes please', '1'])('"%s" reaches the type-of-harm question with the unclear count at 0', async yes => {
    const asked = decode((await send('my partner hits me', atAge({ unclearCount: 1 }))).s);
    const body = await send(yes, asked);
    const s = decode(body.s);
    expect(s.currentGate).toBe('SAFETY_TYPE_OF_HARM');
    expect(s.unclearCount).toBe(0);
    expect(s.v4Option).toBe('safety');
    expect(s.supportNeed).toBe('V4:safety');
    expect(body.m).toBe(getPhrase('SAFETY_TYPE_OF_HARM', false)!.text);
  });

  test.each(['No', 'no thanks', '2'])('"%s" goes back to the same question, earlier answers kept, the trigger not applied', async no => {
    const asked = decode((await send("I'm 30 and my partner hits me", atAge())).s);
    const body = await send(no, asked);
    const s = decode(body.s);
    expect(s.currentGate).toBe('B5_PROFILE_AGE');
    expect(s.supportNeed).toBe('V4:food');
    expect(s.ageCategory).toBeNull();
    expect(body.m).toBe(getPhrase('B5_PROFILE_AGE', false)!.text);
  });

  test('an unclear answer goes back to the same question and uses up nothing', async () => {
    const asked = decode((await send('my partner hits me', atAge())).s);
    const back = decode((await send('maybe', asked)).s);
    expect(back.currentGate).toBe('B5_PROFILE_AGE');
    expect(back.safetyCheckDeclined).toEqual([]);
    const again = await send('my partner hits me', back);
    expect(decode(again.s).currentGate).toBe('SAFETY_DISCLOSURE_CHECK');
  });

  test('an answer that is itself a statement goes to the Safety route', async () => {
    const asked = decode((await send("I'm scared to go home", atAge())).s);
    const s = decode((await send('he said he will kill me', asked)).s);
    expect(s.currentGate).toBe('SAFETY_TYPE_OF_HARM');
  });

  test('the answer never reaches the AI', async () => {
    const asked = decode((await send('my partner hits me', atAge())).s);
    create.mockClear();
    for (const answer of ['hmm not sure what you mean by that', 'yes']) {
      await send(answer, { ...asked });
    }
    expect(create).not.toHaveBeenCalled();
  });

  test('after a No, the families that message matched do not ask again; a different family does', async () => {
    const asked = decode((await send("my partner hits me and said he'll kill me", atAge())).s);
    const back = decode((await send('No', asked)).s);
    expect(back.safetyCheckDeclined).toEqual(['B', 'G']);
    expect(interceptSafetyDisclosure(back, 'he hits me')).toBeNull();
    expect(interceptSafetyDisclosure(back, 'my boss will kill me')).toBeNull();
    const other = await send('I was raped', back);
    expect(decode(other.s).currentGate).toBe('SAFETY_DISCLOSURE_CHECK');
  });

  test('the under-16 check still runs first', async () => {
    const s = decode((await send("I'm 14 and my dad hits me", atAge({ localAuthority: null }))).s);
    expect(s.currentGate).toBe('CRISIS_UNDER16_LOCATION');
    expect(s.safeguardingType).toBe('UNDER_16');
  });

  test('a supporter who says Yes is shown the Safety route in their own wording', async () => {
    const asked = decode((await send('he hits me', atAge({ isSupporter: true, userType: 'SUPPORTER' }))).s);
    const body = await send('Yes', asked);
    const s = decode(body.s);
    expect(s.isSupporter).toBe(false);
    expect(s.userType).toBe('SELF');
    expect(body.m).toBe(getPhrase('SAFETY_TYPE_OF_HARM', false)!.text);
  });

  test('with the Safety route switched off, Yes goes to the crisis question', async () => {
    delete process.env.VA_SAFETY_ROUTE;
    const asked = decode((await send('my partner hits me', atAge())).s);
    const body = await send('Yes', asked);
    expect(decode(body.s).currentGate).toBe('GATE0_CRISIS_DANGER');
    expect(body.m).toBe(getPhrase('GATE0_CRISIS_DANGER', false)!.text);
  });

  // The step log names each step reached, never what was typed, so the
  // question's step name appears there when it is asked (note section 7).
  test('nothing typed is logged or kept', async () => {
    logSpy.mockClear();
    const asked = decode((await send('my partner hits me', atAge())).s);
    const back = decode((await send('No', asked)).s);
    const logged = logSpy.mock.calls.flat().join(' ');
    expect(logged).not.toContain('hits');
    expect(JSON.stringify(back)).not.toContain('hits');
  });
});

describe('going back from every kind of step', () => {
  // Steps whose question is built in code, not one fixed phrase
  const cases: Array<[GateType, Partial<SessionState>]> = [
    ['B5_SECOND_SCREEN', { v4Option: 'everyday' }],
    ['B5_NOTICING', { v4Option: 'everyday' }],
    ['B5_HOUSING_OFFER', { noticingHousing: 'keep-home' }],
    ['LOCATION_POSTCODE', {}],
    ['LOCATION_CONFIRM', { localAuthority: 'Coventry' }],
  ];
  test.each(cases)('after No at %s, the same question again', async (gate, extra) => {
    const at = atAge({ ...extra, currentGate: gate });
    const asked = decode((await send('my partner hits me', at)).s);
    expect(asked.currentGate).toBe('SAFETY_DISCLOSURE_CHECK');
    const body = await send('No', asked);
    expect(decode(body.s).currentGate).toBe(gate);
    expect(body.m && body.m.length > 0).toBe(true);
    if (gate === 'LOCATION_CONFIRM') expect(body.m).toContain('Coventry');
    if (gate === 'B5_NOTICING') expect((body as Body & { ms?: { exclusive: number[] } }).ms?.exclusive.length).toBe(3);
    if (gate === 'B5_SECOND_SCREEN') expect(body.m).toBe(getPhrase(secondScreenPhraseKey('everyday'), false)!.text);
  });

  test('while waiting for the location widget, the location question again', async () => {
    const asked = decode((await send('my partner hits me', atAge({ currentGate: 'LOCATION_RESULT' }))).s);
    const body = await send('No', asked);
    expect(decode(body.s).currentGate).toBe('LOCATION_CONSENT');
  });

  // Work item 2: interruption at every question
  const fs = require('fs') as typeof import('fs');
  const src: string = fs.readFileSync('lib/types.ts', 'utf8');
  const all = (src.match(/export type GateType =([\s\S]*?);/)![1].match(/'([A-Z0-9_]+)'/g) ?? []).map(g => g.replace(/'/g, '')) as GateType[];
  const asked = all.filter(g => !SAFETY_CHECK_EXCLUDED_GATES.includes(g) && g !== 'INIT' && g !== 'TERMINAL_SERVICES');
  test.each(asked)('at %s: asked, and No shows a question again', gate => {
    const s = atAge({ currentGate: gate, v4Option: 'everyday', noticingHousing: 'keep-home' });
    expect(interceptSafetyDisclosure(s, 'my partner hits me')).not.toBeNull();
    const back = questionAgain(s, gate);
    expect(back.text.length).toBeGreaterThan(0);
    expect(back.text).not.toContain('[Missing phrase');
  });
});

describe('a supporter who says Yes', () => {
  test('is still recorded as a supporter at the end of the conversation', async () => {
    const asked = decode((await send('he hits me', atAge({ isSupporter: true, userType: 'SUPPORTER' }))).s);
    const s = decode((await send('Yes', asked)).s);
    expect(s.safetyCheckCameAs).toBe('SUPPORTER');
    logSpy.mockClear();
    let cur = s;
    for (const a of ['7', '2', '2']) {
      const b = await send(a, cur);
      cur = decode(b.s);
      if (b.e) break;
    }
    const ends = logSpy.mock.calls.map(c => String(c[0]) + ' ' + String(c[1] ?? '')).filter(l => l.includes('SESSION END'));
    expect(ends.length).toBeGreaterThan(0);
    expect(ends.join(' ')).toContain('"userType":"SUPPORTER"');
  });
});

describe('where the check runs', () => {
  test.each(SAFETY_CHECK_EXCLUDED_GATES as GateType[])('not at %s', gate => {
    expect(interceptSafetyDisclosure({ ...atAge(), currentGate: gate }, 'my partner hits me')).toBeNull();
  });

  test.each(['PREFERRED_NAME_ASK', 'B5_MAIN_SUPPORT_NEED', 'B5_NOTICING', 'B6_HOMELESSNESS_STATUS', 'LOCATION_POSTCODE'] as GateType[])(
    'at %s', gate => {
      expect(interceptSafetyDisclosure({ ...atAge(), currentGate: gate }, 'my partner hits me')).not.toBeNull();
    });

  test('no option button in the phrasebank sets it off', () => {
    const options = Object.values(phrasebank).flatMap(p => p.options ?? []);
    expect(options.filter(o => detectDisclosure(o).length > 0)).toEqual([]);
  });
});
