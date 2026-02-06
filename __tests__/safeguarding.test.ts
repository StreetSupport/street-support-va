/**
 * Street Support VA - Safeguarding Tests
 *
 * =============================================================================
 * GOVERNANCE CONTEXT
 * =============================================================================
 *
 * This test suite verifies that safeguarding pathways route correctly.
 * These are mechanical checks: given input X, the system produces output Y.
 *
 * WHY THESE TESTS EXIST:
 *
 * The VA serves vulnerable people. Routing failures in safeguarding pathways
 * could result in:
 * - A child being shown adult services instead of Children's Services
 * - A person in crisis not seeing emergency numbers
 * - A DV survivor being asked inappropriate profiling questions
 * - Gender-inappropriate services being displayed
 *
 * These tests run automatically when code changes. If a test fails, it means
 * a safeguarding pathway has changed behaviour - which requires human review
 * before deployment.
 *
 * WHAT THESE TESTS DO NOT DO:
 *
 * - They do not assess tone or language quality (that's manual review)
 * - They do not validate service data quality (that's database responsibility)
 * - They do not test edge cases exhaustively (that's exploratory testing)
 *
 * MAINTENANCE:
 *
 * If a test fails after a code change:
 * 1. Check if the routing change was intentional
 * 2. If yes, update the test to match new expected behaviour
 * 3. If no, the test caught a regression - fix the code
 *
 * =============================================================================
 */

import { createSession, getFirstMessage, processInput, GateType, SessionState } from '../lib/stateMachine';
import { getPhrase } from '../lib/phrasebank';

// Helper: create session at specific gate with profile data
function sessionAt(gate: GateType, profile: Partial<SessionState> = {}): SessionState {
  return {
    ...createSession('test'),
    currentGate: gate,
    ...profile,
  };
}

// Helper: select numbered option
function select(session: SessionState, option: number) {
  return processInput(session, String(option));
}

// =============================================================================
// CRISIS GATE - Must be first, must route correctly
// =============================================================================

describe('Crisis Gate', () => {

  test('is the first thing a user sees', () => {
    const session = createSession('test');
    const result = getFirstMessage(session);
    expect(result.stateUpdates.currentGate).toBe('GATE0_CRISIS_DANGER');
  });

  test('has exactly 7 options', () => {
    const session = createSession('test');
    const result = getFirstMessage(session);
    expect(result.options).toHaveLength(7);
  });

  test('option 5 contains "under 16" (routing depends on array index)', () => {
    const session = createSession('test');
    const result = getFirstMessage(session);
    expect(result.options?.[4]?.toLowerCase()).toContain('under 16');
  });

  test('option 1 (immediate danger) contains 999', () => {
    const session = sessionAt('GATE0_CRISIS_DANGER');
    const result = select(session, 1);
    expect(result.text).toContain('999');
  });

  test('option 4 (self-harm) contains Samaritans number', () => {
    const session = sessionAt('GATE0_CRISIS_DANGER');
    const result = select(session, 4);
    expect(result.text).toContain('116 123');
  });

  test('option 6 (fire/flood) contains emergency housing info', () => {
    // Option 6 routes to CRISIS_FIRE_FLOOD_LOCATION first, so test from there
    const session = sessionAt('CRISIS_FIRE_FLOOD_LOCATION');
    const result = select(session, 1); // Select Wolverhampton
    expect(result.text.toLowerCase()).toContain('emergency');
  });

  test('option 7 (none) proceeds to GATE1_INTENT', () => {
    const session = sessionAt('GATE0_CRISIS_DANGER');
    const result = select(session, 7);
    expect(result.stateUpdates.currentGate).toBe('GATE1_INTENT');
  });

});

// =============================================================================
// UNDER 16 - Must exit to Children's Services, not continue profiling
// =============================================================================

describe('Under 16', () => {

  test('B3_AGE_CATEGORY option 1 is "Under 16" (routing depends on array index)', () => {
    const phrase = getPhrase('B3_AGE_CATEGORY', false);
    expect(phrase?.options?.[0]).toBe('Under 16');
  });

  test('routes to child safeguarding exit, not B4_GENDER', () => {
    const session = sessionAt('B3_AGE_CATEGORY');
    const result = select(session, 1); // Under 16
    expect(result.stateUpdates.currentGate).not.toBe('B4_GENDER');
  });

  test('response contains Childline number', () => {
    const session = sessionAt('B3_AGE_CATEGORY');
    const result = select(session, 1);
    expect(result.text).toContain('0800 1111');
  });

  test('response contains Children\'s Services reference', () => {
    const session = sessionAt('B3_AGE_CATEGORY');
    const result = select(session, 1);
    expect(result.text.toLowerCase()).toContain('children');
  });

  test('does not show adult helplines as primary', () => {
    const session = sessionAt('B3_AGE_CATEGORY');
    const result = select(session, 1);
    // Shelter is adult service
    expect(result.text).not.toContain('0808 800 4444');
  });

});

// =============================================================================
// 16-17 - Must continue profiling (not exit), but flag youth services
// =============================================================================

describe('16-17 Year Olds', () => {

  test('continues to B4_GENDER on full route (not child exit)', () => {
    const session = sessionAt('B3_AGE_CATEGORY', { routeType: 'FULL' });
    const result = select(session, 2); // 16-17
    expect(result.stateUpdates.currentGate).toBe('B4_GENDER');
  });

  test('sets age category to 16-17', () => {
    const session = sessionAt('B3_AGE_CATEGORY');
    const result = select(session, 2);
    expect(result.stateUpdates.ageCategory).toBe('16-17');
  });

});

// =============================================================================
// DOMESTIC ABUSE - Must route to DV exit with appropriate helplines
// =============================================================================

describe('Domestic Abuse Disclosure', () => {

  test('routes away from general profiling', () => {
    const session = sessionAt('B7D_4A_PREVENTION_SAFEGUARDING_FOLLOW_UP', {
      gender: 'Female',
    });
    const result = select(session, 1); // DA option
    expect(result.stateUpdates.currentGate).not.toBe('TERMINAL_SERVICES');
  });

  test('female user sees National DA Helpline', () => {
    // DV flow: B7D_4A option 1 → DV_GENDER_ASK → DV_CHILDREN_ASK → exit
    // Test from DV_CHILDREN_ASK with gender already set
    const session = sessionAt('DV_CHILDREN_ASK', { dvGender: 'Female' });
    const result = select(session, 1); // Has children
    expect(result.text).toContain('0808 2000 247');
  });

  test('male user sees ManKind helpline', () => {
    const session = sessionAt('DV_CHILDREN_ASK', { dvGender: 'Male' });
    const result = select(session, 1); // Has children
    expect(result.text).toContain('0808 800 1170');
  });

});

// =============================================================================
// SELF-HARM (from crisis gate) - Must show support, not abandon
// =============================================================================

describe('Self-Harm Pathway', () => {

  test('contains Samaritans', () => {
    const session = sessionAt('GATE0_CRISIS_DANGER');
    const result = select(session, 4); // Self-harm is option 4
    expect(result.text).toContain('Samaritans');
  });

  test('contains NHS mental health option', () => {
    const session = sessionAt('GATE0_CRISIS_DANGER');
    const result = select(session, 4);
    expect(result.text).toContain('111');
  });

  test('ends session with safeguarding exit', () => {
    const session = sessionAt('GATE0_CRISIS_DANGER');
    const result = select(session, 4);
    expect(result.sessionEnded).toBe(true);
  });

});

// =============================================================================
// GENDER FILTERING - Must not show inappropriate services
// =============================================================================

describe('Gender Filtering at Terminal', () => {

  test('male user response does not contain "women only"', () => {
    const session = sessionAt('TERMINAL_SERVICES', {
      gender: 'Male',
      localAuthority: 'Wolverhampton',
      supportNeed: 'Housing',
      homeless: true,
    });
    const result = processInput(session, '');
    expect(result.text.toLowerCase()).not.toContain('women only');
  });

  test('female user response does not contain "men only"', () => {
    const session = sessionAt('TERMINAL_SERVICES', {
      gender: 'Female',
      localAuthority: 'Wolverhampton',
      supportNeed: 'Housing',
      homeless: true,
    });
    const result = processInput(session, '');
    expect(result.text.toLowerCase()).not.toContain('men only');
  });

});

// =============================================================================
// PREVENTION ESCALATION - Urgent situations get escalated
// =============================================================================

describe('Prevention Escalation', () => {

  test('health crisis option routes to health support', () => {
    const session = sessionAt('B7D_4A_PREVENTION_SAFEGUARDING_FOLLOW_UP', {
      localAuthority: 'Wolverhampton',
    });
    const result = select(session, 2); // Health crisis is option 2
    const hasHealthResponse = result.text.toLowerCase().includes('health') ||
                              result.text.toLowerCase().includes('gp') ||
                              result.text.toLowerCase().includes('nhs');
    expect(hasHealthResponse).toBe(true);
  });

});

// =============================================================================
// FIRE/FLOOD - Must show priority need status
// =============================================================================

describe('Fire/Flood Emergency', () => {

  test('contains council reference', () => {
    // Option 6 at crisis gate goes to CRISIS_FIRE_FLOOD_LOCATION, then exit
    const session = sessionAt('CRISIS_FIRE_FLOOD_LOCATION');
    const result = select(session, 1); // Select Wolverhampton
    expect(result.text.toLowerCase()).toContain('council');
  });

  test('contains Shelter reference', () => {
    const session = sessionAt('CRISIS_FIRE_FLOOD_LOCATION');
    const result = select(session, 1); // Select Wolverhampton
    const hasShelter = result.text.includes('0808 800 4444') ||
                       result.text.toLowerCase().includes('shelter');
    expect(hasShelter).toBe(true);
  });

});

// =============================================================================
// CONTENT EXISTENCE - Critical content hasn't been deleted
// =============================================================================

describe('Critical Content Exists', () => {

  test('crisis gate produces non-empty response', () => {
    const session = createSession('test');
    const result = getFirstMessage(session);
    expect(result.text.length).toBeGreaterThan(50);
  });

  test('under 16 exit produces non-empty response', () => {
    const session = sessionAt('B3_AGE_CATEGORY');
    const result = select(session, 1);
    expect(result.text.length).toBeGreaterThan(50);
  });

  test('self-harm exit produces non-empty response', () => {
    const session = sessionAt('GATE0_CRISIS_DANGER');
    const result = select(session, 4); // Self-harm is option 4
    expect(result.text.length).toBeGreaterThan(50);
  });

  test('DV exit produces non-empty response', () => {
    const session = sessionAt('B7D_4A_PREVENTION_SAFEGUARDING_FOLLOW_UP', {
      gender: 'Female',
    });
    const result = select(session, 1);
    expect(result.text.length).toBeGreaterThan(50);
  });

});
