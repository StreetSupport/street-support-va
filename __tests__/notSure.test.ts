/**
 * "I'm not sure where to start" (design paper, Part C, section 2; Managing
 * Director, 26 November 2026). All inputs are made up for the tests.
 */

process.env.ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY ?? 'test-key-not-used';

import * as fs from 'fs';
import * as path from 'path';
import { POST } from '../app/api/chat/route';
import { createSession, processInput } from '../lib/stateMachine';
import { visibleFirstOptions } from '../lib/data/v4Categories';
import { getPhrase } from '../lib/phrasebank';
import { NO_PLACE_TO_START, NOT_SURE_OPENER, awarenessLine, notSureOptions } from '../lib/noticing';
import { setClaudeClientForTests, type ClaudeClient } from '../lib/claudeClassifiers';
import type { SessionState } from '../lib/types';

const at = (over: Partial<SessionState> = {}): SessionState =>
  ({ ...createSession('test'), currentGate: 'B5_MAIN_SUPPORT_NEED', localAuthority: 'Wolverhampton', routeType: 'QUICK', ...over });
const firstNumber = (id: string) => String(visibleFirstOptions().findIndex(o => o.id === id) + 1);
const pick = (label: string) => String(notSureOptions().indexOf(label) + 1);
const step = (s: SessionState, input: string) => { const r = processInput(s, input); return { r, s: { ...s, ...r.stateUpdates } as SessionState }; };
const asked = (over: Partial<SessionState> = {}) => step(at(over), firstNumber('not-sure'));

const savedSwitch = process.env.VA_SAFETY_ROUTE;
afterEach(() => { if (savedSwitch === undefined) delete process.env.VA_SAFETY_ROUTE; else process.env.VA_SAFETY_ROUTE = savedSwitch; });

describe('the question', () => {
  test('choosing "not sure" asks what is putting pressure on them, in the approved wording', () => {
    const { r, s } = asked();
    expect(s.currentGate).toBe('B5_NOT_SURE');
    expect(r.text.startsWith(NOT_SURE_OPENER)).toBe(true);
    expect(r.text).toContain('You can choose more than one.');
    expect(r.options?.[0]).toBe('Feeling unsafe');
    expect(r.options).not.toContain('Nothing else');
    expect(r.options?.slice(-2)).toEqual(["I'd rather talk to someone in person", "I'm not sure"]);
    expect(r.multiSelect?.exclusive).toEqual([r.options!.length - 1, r.options!.length]);
  });

  test('the placeholder is gone from the code', () => {
    const dir = path.join(__dirname, '..', 'lib');
    const walk = (d: string): string[] => fs.readdirSync(d, { withFileTypes: true })
      .flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
    const hits = walk(dir).filter(f => /\.tsx?$/.test(f) && fs.readFileSync(f, 'utf8').includes('Not built yet'));
    expect(hits).toEqual([]);
  });
});

describe('where the answers go', () => {
  test('Feeling unsafe, with the Safety route switched off: the crisis question', () => {
    delete process.env.VA_SAFETY_ROUTE;
    const { s } = step(asked().s, `${pick('Feeling unsafe')}, ${pick('Money, work or bills')}`);
    expect(s.currentGate).toBe('GATE0_CRISIS_DANGER');
  });

  test('Feeling unsafe, with the Safety route switched on: the type-of-harm question', () => {
    process.env.VA_SAFETY_ROUTE = 'on';
    const { s } = step(asked().s, pick('Feeling unsafe'));
    expect(s.currentGate).toBe('SAFETY_TYPE_OF_HARM');
    expect(s.supportNeed).toBe('V4:safety');
  });

  test('either housing answer: the housing route, as "Somewhere to live" on the first question', () => {
    for (const label of ["I don't have a settled place to live", 'Keeping my home or paying rent']) {
      const { s } = step(asked().s, `${pick('Money, work or bills')}, ${pick(label)}`);
      expect(s.v4Option).toBe('housing');
      expect(['B5_PROFILE_AGE', 'B6_HOMELESSNESS_STATUS']).toContain(s.currentGate);
    }
  });

  test.each([
    ['Money, work or bills', 'money-work'],
    ["Health, including how I'm feeling", 'health'],
    ['Drink, drugs or gambling', 'health'],
  ])('%s alone: that topic, as if chosen on the first question', (label, option) => {
    const { s } = step(asked().s, pick(label));
    expect(s.v4Option).toBe(option);
    expect(s.currentGate).toBe('B5_SECOND_SCREEN');
    expect(s.noticingAsked).toBe(true);
    expect(s.notSureAware).toBeFalsy();
  });

  test('several ticked: the first with a topic, and the awareness line is kept for the results', () => {
    const { s } = step(asked().s, `${pick('Family or relationships')}, ${pick("Health, including how I'm feeling")}, ${pick('Money, work or bills')}`);
    expect(s.v4Option).toBe('money-work');
    expect(s.notSureAware).toBe(true);
  });

  test('the noticing question is not asked again on the way to the results', () => {
    let { s } = step(asked().s, `${pick('Money, work or bills')}, ${pick('Family or relationships')}`);
    for (let i = 0; i < 10 && !String(s.currentGate).startsWith('TERMINAL'); i++) {
      expect(s.currentGate).not.toBe('B5_NOTICING');
      s = step(s, s.currentGate === 'B5_PROFILE_AGE' ? '4' : '1').s;
    }
    expect(String(s.currentGate).startsWith('TERMINAL')).toBe(true);
  });

  test.each([
    ['Family or relationships'],
    ["I'd rather talk to someone in person"],
    ["I'm not sure"],
  ])('%s: the honest line and the first question again', (label) => {
    const { r, s } = step(asked().s, pick(label));
    expect(r.text.startsWith(NO_PLACE_TO_START)).toBe(true);
    expect(r.text).toContain(getPhrase('B5_MAIN_SUPPORT_NEED', false)!.text);
    expect(s.currentGate).toBe('B5_MAIN_SUPPORT_NEED');
  });

  test('a first unclear answer asks again; a second gives 999 and the in-person route', () => {
    const first = step(asked().s, 'hard to say');
    expect(first.s.currentGate).toBe('B5_NOT_SURE');
    const second = step(first.s, 'still hard to say');
    expect(second.r.text).toContain('call 999');
    expect(second.r.text).toContain(NO_PLACE_TO_START);
    expect(second.s.currentGate).toBe('B5_MAIN_SUPPORT_NEED');
    expect(second.s.unclearCount).toBe(0);
  });

  test('a supporter goes to the in-person route, as supporters are not asked the noticing question', () => {
    const { r, s } = asked({ isSupporter: true, userType: 'SUPPORTER' });
    expect(r.text.startsWith(NO_PLACE_TO_START)).toBe(true);
    expect(s.currentGate).toBe('B5_MAIN_SUPPORT_NEED');
  });

  test('the awareness line is the existing one', () => {
    expect(awarenessLine(at({ v4Option: 'money-work' }))).toContain('When a few things are pressing at once');
  });
});

describe('through the route', () => {
  type Body = { s: string; m?: string; o?: string[]; ms?: { exclusive: number[] } };
  const encode = (s: SessionState) => Buffer.from(JSON.stringify(s)).toString('base64');
  const decode = (s: string) => JSON.parse(Buffer.from(s, 'base64').toString('utf8')) as SessionState;
  async function send(message: string, session: SessionState): Promise<Body> {
    const req = new Request('http://localhost/api/chat', {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ message, s: encode(session) }),
    });
    const res = await POST(req as unknown as Parameters<typeof POST>[0]);
    return (await res.json()) as Body;
  }
  let logSpy: jest.SpyInstance;
  beforeEach(() => { logSpy = jest.spyOn(console, 'log').mockImplementation(() => {}); });
  afterEach(() => logSpy.mockRestore());

  test('the question comes with the multi-select signal, and its answer never reaches the AI', async () => {
    const create = jest.fn(() => Promise.reject(new Error('not called')));
    setClaudeClientForTests({ messages: { create } } as unknown as ClaudeClient);
    const first = await send(firstNumber('not-sure'), at());
    expect(decode(first.s).currentGate).toBe('B5_NOT_SURE');
    expect(first.ms?.exclusive.length).toBe(2);
    await send('something hard to describe', decode(first.s));
    expect(create).not.toHaveBeenCalled();
  });
});
