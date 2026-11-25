/**
 * Strict reading at the crisis question and the questions it leads to, and
 * the general exits where gender is not given.
 *
 * James Cross's review of #69 (24 November 2026); Managing Director's
 * decisions of 11 November (general exit, Safeguarding Contract 3.3) and
 * 25 November 2026 (help then carry on at the crisis question; a second
 * unclear answer at the children question counts as Yes; local organisations
 * each say who they are for). All inputs below are made up for the tests.
 */

import { POST } from '../app/api/chat/route';
import { createSession, processInput } from '../lib/stateMachine';
import { setClaudeClientForTests, type ClaudeClient } from '../lib/claudeClassifiers';
import { parseStrictChoice } from '../lib/handlers/crisis';
import type { GateType, SessionState } from '../lib/types';

type Body = { s: string; m?: string; o?: string[]; e?: boolean };

function encode(s: SessionState): string {
  return Buffer.from(JSON.stringify(s)).toString('base64');
}
function decode(s: string): SessionState {
  return JSON.parse(Buffer.from(s, 'base64').toString('utf8')) as SessionState;
}
function sessionAt(gate: GateType, extra: Partial<SessionState> = {}): SessionState {
  return { ...createSession('test'), currentGate: gate, ...extra };
}
async function send(message: string, session: SessionState): Promise<Body> {
  const req = new Request('http://localhost/api/chat', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ message, s: encode(session) }),
  });
  const res = await POST(req as unknown as Parameters<typeof POST>[0]);
  return (await res.json()) as Body;
}
async function twice(message: string, session: SessionState): Promise<Body> {
  const first = await send(message, session);
  return send(message, decode(first.s));
}

let create: jest.Mock;
let logSpy: jest.SpyInstance;
beforeEach(() => {
  create = jest.fn(() => Promise.resolve({ content: [{ type: 'text', text: '1' }] }));
  setClaudeClientForTests({ messages: { create } } as unknown as ClaudeClient);
  logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
});
afterEach(() => {
  setClaudeClientForTests(null);
  logSpy.mockRestore();
});

describe('Strict reading', () => {
  const options = ['Female', 'Male', 'Non-binary or other', 'Prefer not to say'];

  test('a number or an option\'s exact words count', () => {
    expect(parseStrictChoice('2', options)).toBe(2);
    expect(parseStrictChoice('  prefer NOT to say ', options)).toBe(4);
  });

  test('free text, several numbers, a number out of range or nothing do not', () => {
    expect(parseStrictChoice('I am a man', options)).toBeNull();
    expect(parseStrictChoice('1 and 2', options)).toBeNull();
    expect(parseStrictChoice('5', options)).toBeNull();
    expect(parseStrictChoice('', options)).toBeNull();
  });

  test.each(['GATE0_CRISIS_DANGER', 'DV_GENDER_ASK', 'DV_CHILDREN_ASK', 'SA_GENDER_ASK'] as GateType[])(
    'at %s, typed text asks again on the same question and Claude is never called',
    async (gate) => {
      const body = await send('it is complicated really', sessionAt(gate));
      expect(decode(body.s).currentGate).toBe(gate);
      expect(body.m).toContain("I didn't quite catch that");
      expect(body.o!.length).toBeGreaterThan(1);
      expect(create).not.toHaveBeenCalled();
    },
  );
});

describe('A second unclear answer shows help at once', () => {
  test('crisis question: 999 first, every crisis line, then the choice to carry on', async () => {
    const body = await twice('hard to say', sessionAt('GATE0_CRISIS_DANGER'));
    const s = decode(body.s);
    expect(s.currentGate).toBe('CRISIS_UNCLEAR_HELP');
    expect(body.e).toBeFalsy();
    expect(body.m!.startsWith("If you're in immediate danger, call 999.")).toBe(true);
    for (const n of ['0808 2000 247', '0808 500 2222', '116 123', '0800 1111']) expect(body.m).toContain(n);
    expect(body.o).toEqual(['Carry on']);
    expect(s.unclearCount).toBe(0);
    expect(create).not.toHaveBeenCalled();
  });

  test('crisis help, then carry on: where "None of these apply" goes', async () => {
    const help = await twice('hard to say', sessionAt('GATE0_CRISIS_DANGER'));
    const next = await send('ok', decode(help.s));
    const none = processInput(sessionAt('GATE0_CRISIS_DANGER'), '7');
    expect(decode(next.s).currentGate).toBe(none.stateUpdates.currentGate);
  });

  test('crisis help for a supporter speaks about them', async () => {
    const body = await twice('hard to say', sessionAt('GATE0_CRISIS_DANGER', { isSupporter: true, userType: 'SUPPORTER' }));
    expect(body.m!.startsWith("If they're in immediate danger, call 999.")).toBe(true);
    expect(body.m).toContain("IF THEY'RE UNDER 16");
  });

  test('domestic abuse gender question: the general exit', async () => {
    const body = await twice('not sure', sessionAt('DV_GENDER_ASK'));
    expect(body.e).toBe(true);
    for (const n of ['0808 2000 247', '0808 800 1170', '0800 999 5428']) expect(body.m).toContain(n);
  });

  test('domestic abuse children question: counts as Yes', async () => {
    const body = await twice('maybe', sessionAt('DV_CHILDREN_ASK', { dvGender: 'Female' }));
    const yes = processInput(sessionAt('DV_CHILDREN_ASK', { dvGender: 'Female' }), '1');
    expect(body.e).toBe(true);
    expect(body.m!.startsWith(yes.text.slice(0, 60))).toBe(true);
  });

  test('sexual violence gender question: the general exit', async () => {
    const body = await twice('not sure', sessionAt('SA_GENDER_ASK'));
    expect(body.e).toBe(true);
    for (const n of ['0808 500 2222', '0808 801 0332', '0800 999 5428']) expect(body.m).toContain(n);
  });
});

describe('General exits where gender is not given', () => {
  test('domestic abuse, "Prefer not to say": 999 first, each national line with who it is for and when it is open', () => {
    const r = processInput(sessionAt('DV_CHILDREN_ASK', { dvGender: 'Prefer not to say' }), '2');
    expect(r.sessionEnded).toBe(true);
    expect(r.text.startsWith("If you're in immediate danger, call 999.")).toBe(true);
    expect(r.text).toContain('For women\n0808 2000 247 (24/7');
    expect(r.text).toContain('For men\n0808 800 1170 (Monday to Friday, 10am to 4pm');
    expect(r.text).toContain('For LGBTQ+ people aged 18 and over\n0800 999 5428 (Monday and Tuesday');
    expect(r.text).not.toContain('—');
  });

  test('domestic abuse: each local organisation says who it is for (Coventry has two)', () => {
    const r = processInput(sessionAt('DV_CHILDREN_ASK', { dvGender: 'Prefer not to say', localAuthority: 'Coventry' }), '1');
    expect(r.text).toContain('Valley House\nFor anyone aged 16 and over');
    expect(r.text).toContain('Coventry Haven: Safe to Talk Helpline\nFor women');
    expect(r.text.indexOf('LOCAL DOMESTIC ABUSE SUPPORT')).toBeLessThan(r.text.indexOf('NATIONAL DOMESTIC ABUSE LINES'));
  });

  test('domestic abuse in the Black Country: men are told they can be referred', () => {
    const r = processInput(sessionAt('DV_CHILDREN_ASK', { dvGender: 'Prefer not to say', localAuthority: 'Walsall' }), '1');
    expect(r.text).toContain("Black Country Women's Aid\nFor women and children. Men can call the office line to be referred");
  });

  test('domestic abuse, "Non-binary or other" keeps its existing exit', () => {
    const r = processInput(sessionAt('DV_CHILDREN_ASK', { dvGender: 'Non-binary or other' }), '2');
    expect(r.text).toContain('Galop');
    expect(r.text).not.toContain('ManKind');
  });

  test('sexual violence, "Prefer not to say": 999 first, the local centre, each national line', () => {
    const r = processInput(sessionAt('SA_GENDER_ASK'), '4');
    expect(r.sessionEnded).toBe(true);
    expect(r.text.startsWith("If you're in immediate danger, call 999.")).toBe(true);
    expect(r.text).toContain('LOCAL SEXUAL ASSAULT REFERRAL CENTRE');
    expect(r.text).toContain('For anyone aged 16 and over\n0808 500 2222');
    expect(r.text).toContain('For men, boys and non-binary people\n0808 801 0332 (Monday to Friday, 10am to 12pm)');
    expect(r.text).toContain('0800 999 5428');
  });

  test('professional version uses the professional lead', () => {
    const r = processInput(sessionAt('SA_GENDER_ASK', { isSupporter: true, userType: 'PROFESSIONAL' }), '4');
    expect(r.text).toContain('Here are the specialist contacts.');
    expect(r.text.startsWith("If they're in immediate danger, call 999.")).toBe(true);
  });
});
