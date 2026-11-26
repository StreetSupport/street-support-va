/**
 * Children: outputs restored from the original phrasebank (CHAR_VA_Phrasebank_v7.md,
 * v7.1), Managing Director, 26 November 2026. All sessions are made up.
 */

import { createSession, processInput } from '../lib/stateMachine';
import type { GateType, SessionState } from '../lib/types';

const at = (gate: GateType, extra: Partial<SessionState> = {}): SessionState =>
  ({ ...createSession('test'), currentGate: gate, ...extra });

let logSpy: jest.SpyInstance;
beforeEach(() => { logSpy = jest.spyOn(console, 'log').mockImplementation(() => {}); });
afterEach(() => logSpy.mockRestore());

describe("Domestic abuse: a Yes to children adds the council's Children's Services", () => {
  test.each(['Female', 'Male', 'Non-binary or other', 'Prefer not to say'])('%s: Yes adds it, No does not', (dvGender) => {
    const yes = processInput(at('DV_CHILDREN_ASK', { dvGender, localAuthority: 'Walsall' }), '1');
    const no = processInput(at('DV_CHILDREN_ASK', { dvGender, localAuthority: 'Walsall' }), '2');
    expect(yes.text).toContain("CHILDREN'S SERVICES\nWalsall Children's Services");
    expect(no.text).not.toContain("CHILDREN'S SERVICES");
  });

  test("area not known yet (crisis question first): how to find Children's Services", () => {
    const yes = processInput(at('DV_CHILDREN_ASK', { dvGender: 'Female' }), '1');
    expect(yes.text).toContain("ask for Children's Services:\nhttps://www.gov.uk/find-local-council");
  });

  test("Children's Services sits before the exit's closing 999 line", () => {
    const yes = processInput(at('DV_CHILDREN_ASK', { dvGender: 'Female', localAuthority: 'Walsall' }), '1');
    expect(yes.text.indexOf("CHILDREN'S SERVICES")).toBeLessThan(yes.text.indexOf("If you're in immediate danger, call 999"));
  });
});

describe('Prevention with children', () => {
  const base = { localAuthority: 'Walsall', preventionChildren: 'Yes', preventionReason: 'Rent arrears' } as Partial<SessionState>;

  test('urgent: the fuller escalation, the council contact, and the conversation carries on', () => {
    const r = processInput(at('B7D_4_PREVENTION_SAFEGUARDING_SIGNALS', { ...base, preventionUrgency: 'Now/soon' }), '2');
    expect(r.text).toContain('You may want to tell them:');
    expect(r.text).toContain('Walsall Housing Options');
    expect(r.sessionEnded).toBeFalsy();
    expect(r.stateUpdates.currentGate).toBe('TERMINAL_ADDITIONAL_NEEDS');
    expect(r.options?.length).toBeGreaterThan(0);
  });

  test('urgent, supporter: their version', () => {
    const r = processInput(at('B7D_4_PREVENTION_SAFEGUARDING_SIGNALS', { ...base, preventionUrgency: 'Now/soon', isSupporter: true }), '2');
    expect(r.text).toContain('They may want to tell the council:');
  });

  test('not urgent: the family advice before the results, with Family Fund described correctly', () => {
    const r = processInput(at('B7D_4_PREVENTION_SAFEGUARDING_SIGNALS', { ...base, preventionUrgency: 'Not immediate' }), '2');
    expect(r.text.startsWith('Because you have children')).toBe(true);
    expect(r.text).toContain('raising a disabled or seriously ill child');
  });

  test('no children: no family advice', () => {
    const r = processInput(at('B7D_4_PREVENTION_SAFEGUARDING_SIGNALS', { ...base, preventionChildren: 'No', preventionUrgency: 'Not immediate' }), '2');
    expect(r.text).not.toContain('Because you have children');
  });

  test("child safety concern: the council's Children's Services", () => {
    const r = processInput(at('B7D_4A_PREVENTION_SAFEGUARDING_FOLLOW_UP', { localAuthority: 'Walsall' }), '4');
    expect(r.text).toContain("CHILDREN'S SERVICES\nWalsall Children's Services");
    expect(r.text).toContain('NSPCC');
  });
});
