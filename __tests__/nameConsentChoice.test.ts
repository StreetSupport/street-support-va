// Decisions of 3 November 2026: the preferred name is kept for the human
// touch; the extra questions are offered as a choice, not a consent; every
// sensitive question can be declined.

import type { SessionState } from '../lib/types';
import { createSession, processInput } from '../lib/stateMachine';
import { getPhrase } from '../lib/phrasebank';
import { cleanPreferredName, withNameBeforeFullStop } from '../lib/utils/preferredName';

function sessionAt(gate: SessionState['currentGate'], profile: Partial<SessionState> = {}): SessionState {
  return { ...createSession('test'), currentGate: gate, ...profile };
}

describe('Preferred name', () => {
  test('a person who gives a name is thanked by name and it is kept for the session', () => {
    const result = processInput(sessionAt('PREFERRED_NAME_ASK'), 'Sam');
    expect(result.stateUpdates.preferredName).toBe('Sam');
    expect(result.text.startsWith('Thanks, Sam.')).toBe(true);
    expect(result.stateUpdates.currentGate).toBe('ACCESS_LOCATION_ASK');
  });

  test('a short name is not mistaken for "Skip"', () => {
    const result = processInput(sessionAt('PREFERRED_NAME_ASK'), 'Ki');
    expect(result.stateUpdates.preferredName).toBe('Ki');
  });

  test('skipping carries on without a name', () => {
    for (const input of ['Skip', 'skip', '1', '']) {
      const result = processInput(sessionAt('PREFERRED_NAME_ASK'), input);
      expect(result.stateUpdates.preferredName).toBeNull();
      expect(result.text.startsWith('Thanks,')).toBe(false);
    }
  });

  test('an answer that is not a name is not kept', () => {
    expect(cleanPreferredName('my name is Sam and I need a hostel')).toBeNull();
    expect(cleanPreferredName('sam@example.org')).toBeNull();
    expect(cleanPreferredName('07700 900123')).toBeNull();
    expect(cleanPreferredName('Mary-Jane')).toBe('Mary-Jane');
    expect(cleanPreferredName("D'Arcy")).toBe("D'Arcy");
  });

  test('the goodbye uses the name when there is one', () => {
    expect(withNameBeforeFullStop('Take care of yourself. Come back anytime.', 'Sam'))
      .toBe('Take care of yourself, Sam. Come back anytime.');
    expect(withNameBeforeFullStop('Take care of yourself. Come back anytime.', null))
      .toBe('Take care of yourself. Come back anytime.');
    const done = processInput(sessionAt('TERMINAL_ADDITIONAL_NEEDS', { preferredName: 'Sam', needCount: 1 }), '2');
    expect(done.text).toContain('Sam');
  });
});

describe('Extra questions are a choice, not a consent', () => {
  test('the screen offers to answer or skip, and does not ask for consent', () => {
    for (const supporter of [false, true]) {
      const screen = getPhrase('C2_CONSENT_GATE', supporter)!;
      expect(screen.options).toEqual(['Yes', 'Skip these']);
      expect(screen.text.toLowerCase()).not.toContain('consent');
    }
  });

  test('skipping goes straight to results without the extra questions', () => {
    const session = sessionAt('C2_CONSENT_GATE', { localAuthority: 'Wolverhampton', supportNeed: 'Emergency Housing', homeless: true });
    const result = processInput(session, '2');
    expect(result.stateUpdates.currentGate).toBe('TERMINAL_ADDITIONAL_NEEDS');
  });

  test('choosing yes goes on to the extra questions', () => {
    const session = sessionAt('C2_CONSENT_GATE', { localAuthority: 'Wolverhampton', supportNeed: 'Emergency Housing', homeless: true });
    const result = processInput(session, '1');
    expect(result.stateUpdates.currentGate).toBe('C3Q1_IMMIGRATION_STATUS');
  });
});

describe('Every sensitive question can be declined', () => {
  test('ethnicity: prefer not to say stores nothing', () => {
    const result = processInput(sessionAt('C3Q6_ETHNICITY'), '7');
    expect(result.stateUpdates.ethnicity).toBeNull();
    expect(result.stateUpdates.currentGate).toBe('C3Q7_PHYSICAL_HEALTH');
  });

  test('physical health: prefer not to say stores nothing', () => {
    const result = processInput(sessionAt('C3Q7_PHYSICAL_HEALTH'), '7');
    expect(result.stateUpdates.physicalHealth).toBeNull();
    expect(result.stateUpdates.currentGate).toBe('C3Q8_MENTAL_HEALTH');
  });

  test('where someone is using the service from: prefer not to say stores nothing', () => {
    const result = processInput(sessionAt('ACCESS_LOCATION_ASK'), '7');
    expect(result.stateUpdates.accessLocation).toBeNull();
    expect(result.stateUpdates.currentGate).toBe('RETURN_USER_ASK');
  });

  test('used Street Support before: prefer not to say stores nothing and skips the follow-up', () => {
    const declined = processInput(sessionAt('RETURN_USER_ASK'), '3');
    expect(declined.stateUpdates.returnUser).toBeNull();
    expect(declined.stateUpdates.currentGate).toBe('B2_WHO_FOR');
    const no = processInput(sessionAt('RETURN_USER_ASK'), '2');
    expect(no.stateUpdates.returnUser).toBe(false);
  });

  test('the options shown match: each question offers prefer not to say', () => {
    for (const key of ['C3Q6_ETHNICITY', 'C3Q7_PHYSICAL_HEALTH', 'ACCESS_LOCATION_ASK', 'RETURN_USER_ASK']) {
      for (const supporter of [false, true]) {
        expect(getPhrase(key, supporter)!.options).toContain('Prefer not to say');
      }
    }
  });
});
