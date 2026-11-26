/**
 * Children: outputs restored from the original phrasebank (CHAR_VA_Phrasebank_v7.md,
 * v7.1), Managing Director, 26 November 2026. All sessions are made up.
 */

import { createSession, processInput } from '../lib/stateMachine';
import { crisisQuestionFallback } from '../lib/handlers/crisis';
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
    const r = processInput(at('B7D_4_PREVENTION_SAFEGUARDING_SIGNALS', { ...base, preventionUrgency: 'Not urgent' }), '2');
    expect(r.text.startsWith('Because you have children')).toBe(true);
    expect(r.text).toContain('raising a disabled or seriously ill child');
  });

  test('no children: no family advice', () => {
    const r = processInput(at('B7D_4_PREVENTION_SAFEGUARDING_SIGNALS', { ...base, preventionChildren: 'No', preventionUrgency: 'Not urgent' }), '2');
    expect(r.text).not.toContain('Because you have children');
  });

  test("child safety concern: the council's Children's Services", () => {
    const r = processInput(at('B7D_4A_PREVENTION_SAFEGUARDING_FOLLOW_UP', { localAuthority: 'Walsall' }), '4');
    expect(r.text).toContain("CHILDREN'S SERVICES\nWalsall Children's Services");
    expect(r.text).toContain('NSPCC');
  });
});

describe('Review fixes, 26 November', () => {
  test("child safety concern: Children's Services comes first, before NSPCC and the 999 line", () => {
    const r = processInput(at('B7D_4A_PREVENTION_SAFEGUARDING_FOLLOW_UP', { localAuthority: 'Walsall' }), '4');
    const cs = r.text.indexOf("CHILDREN'S SERVICES");
    expect(cs).toBeGreaterThan(0);
    expect(cs).toBeLessThan(r.text.indexOf('NSPCC'));
    expect(cs).toBeLessThan(r.text.indexOf('999'));
  });

  test("the follow-up's other answers still get the family ending (urgent, with children)", () => {
    const r = processInput(at('B7D_4A_PREVENTION_SAFEGUARDING_FOLLOW_UP', {
      localAuthority: 'Sandwell', preventionChildren: 'Yes', preventionUrgency: 'Now/soon', preventionReason: 'Rent arrears',
    }), '5');
    expect(r.text).toContain('You may want to tell them:');
    expect(r.text).toContain('Sandwell');
  });

  test("the follow-up's other answers still get the family advice (not urgent, with children)", () => {
    const r = processInput(at('B7D_4A_PREVENTION_SAFEGUARDING_FOLLOW_UP', {
      localAuthority: 'Sandwell', preventionChildren: 'Yes', preventionUrgency: 'Not urgent', preventionReason: 'Rent arrears',
    }), '3');
    expect(r.text.startsWith('Because you have children')).toBe(true);
  });

  test('council contacts keep their menu option, hours and notes', () => {
    const wolves = processInput(at('B7D_4_PREVENTION_SAFEGUARDING_SIGNALS', {
      localAuthority: 'Wolverhampton', preventionChildren: 'Yes', preventionUrgency: 'Now/soon', preventionReason: 'Rent arrears',
    }), '2');
    expect(wolves.text).toContain('01902 556789, option 2 (Mon-Fri 9am-5pm)');
    const brum = processInput(at('B7D_4_PREVENTION_SAFEGUARDING_SIGNALS', {
      localAuthority: 'Birmingham', preventionChildren: 'Yes', preventionUrgency: 'Now/soon', preventionReason: 'Rent arrears',
    }), '2');
    expect(brum.text).toContain('Out of hours: 0121 303 2296 (18+ only. Under 18: 0121 675 4806)');
  });

  test("Walsall Children's Services is shown without a menu option (decision of 26 November)", () => {
    const r = processInput(at('DV_CHILDREN_ASK', { dvGender: 'Female', localAuthority: 'Walsall' }), '1');
    expect(r.text).toContain('0300 555 2866');
    expect(r.text).not.toContain('0300 555 2866, option 2');
  });

  test("supporters are told about their council, not 'your council'", () => {
    const urgent = processInput(at('B7D_4_PREVENTION_SAFEGUARDING_SIGNALS', {
      localAuthority: 'Walsall', preventionChildren: 'Yes', preventionUrgency: 'Now/soon', preventionReason: 'Rent arrears', isSupporter: true,
    }), '2');
    expect(urgent.text).toContain("THE COUNCIL'S HOUSING OPTIONS TEAM");
    expect(urgent.text).not.toContain("YOUR COUNCIL'S");
    const dv = processInput(at('DV_CHILDREN_ASK', { dvGender: 'Female', isSupporter: true, userType: 'SUPPORTER' }), '1');
    expect(dv.text).toContain("Contact their local council and ask for Children's Services");
  });

  test('supporters get their own family advice', () => {
    const r = processInput(at('B7D_4_PREVENTION_SAFEGUARDING_SIGNALS', {
      localAuthority: 'Walsall', preventionChildren: 'Yes', preventionUrgency: 'Not urgent', preventionReason: 'Rent arrears', isSupporter: true,
    }), '2');
    expect(r.text.startsWith('Because they have children')).toBe(true);
  });

  test('the supporter version of the domestic abuse children question asks about children only', () => {
    const r = processInput(at('DV_GENDER_ASK', { isSupporter: true, userType: 'SUPPORTER' }), '1');
    expect(r.text).toContain('Do they have dependent children?');
    expect(r.text).not.toMatch(/pregnant/i);
  });

  test.each([['Female', '1'], ['Male', '2'], ['Non-binary or other', '1'], ['Prefer not to say', '2']])(
    "every domestic abuse exit gives the council's Housing Options (%s, answer %s)", (dvGender, answer) => {
      const r = processInput(at('DV_CHILDREN_ASK', { dvGender, localAuthority: 'Coventry' }), answer);
      expect(r.text).toContain('HOUSING OPTIONS');
      expect(r.text).toContain('024 7683 4025');
    });
});

describe('Second review fixes, 26 November', () => {
  test.each([
    [{ isSupporter: true, userType: 'SUPPORTER' }, "You don't have to work this out on your own."],
    [{ isSupporter: true, userType: 'PROFESSIONAL' }, "You'll know your next steps from here."],
  ])('supporter and professional exits keep the sign-off after the council contacts', (who, signOff) => {
    const r = processInput(at('DV_CHILDREN_ASK', { dvGender: 'Female', localAuthority: 'Walsall', ...who } as Partial<SessionState>), '1');
    expect(r.text.indexOf("CHILDREN'S SERVICES")).toBeLessThan(r.text.indexOf(signOff));
    expect(r.text.indexOf('HOUSING OPTIONS')).toBeLessThan(r.text.indexOf(signOff));
  });

  test('a second unclear answer at the gender question still gives Housing Options', () => {
    const r = crisisQuestionFallback(at('DV_GENDER_ASK', { localAuthority: 'Coventry' }));
    expect(r.text).toContain('HOUSING OPTIONS');
    expect(r.text).toContain('024 7683 4025');
  });

  test("with no council known, supporters are pointed to 'their' local council", () => {
    const r = processInput(at('DV_CHILDREN_ASK', { dvGender: 'Male', isSupporter: true, userType: 'SUPPORTER' }), '2');
    expect(r.text).toContain('Find their local council');
    expect(r.text).not.toContain('Find your local council');
  });

  test("a contact's note is shown (Solihull)", () => {
    const r = processInput(at('DV_CHILDREN_ASK', { dvGender: 'Female', localAuthority: 'Solihull' }), '2');
    expect(r.text).toContain('Automatically transfers to out-of-hours service');
  });
});
