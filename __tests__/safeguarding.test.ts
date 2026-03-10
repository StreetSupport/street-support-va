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

import type { GateType, SessionState } from '../lib/types';
import { toUserProfile } from '../lib/types';
import { createSession, getFirstMessage, processInput } from '../lib/stateMachine';
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

  test('option 2 contains "under 16" (routing depends on array index)', () => {
    const session = createSession('test');
    const result = getFirstMessage(session);
    expect(result.options?.[1]?.toLowerCase()).toContain('under 16');
  });

  test('option 1 (immediate danger) contains 999', () => {
    const session = sessionAt('GATE0_CRISIS_DANGER');
    const result = select(session, 1);
    expect(result.text).toContain('999');
  });

  test('option 3 (self-harm) contains Samaritans number', () => {
    const session = sessionAt('GATE0_CRISIS_DANGER');
    const result = select(session, 3);
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

  test('Birmingham 16-17 sees St Basil\'s but not SIFA Fireside in terminal', () => {
    const session = sessionAt('B7_HOMELESS_SLEEPING_SITUATION', {
      ageCategory: '16-17',
      gender: 'Male',
      localAuthority: 'Birmingham',
      supportNeed: 'Emergency Housing',
      homeless: true,
      routeType: 'QUICK',
    });
    const result = select(session, 3); // Sofa surfing -> terminal
    expect(result.text).toContain('St Basil');
    expect(result.text).not.toContain('SIFA Fireside');
  });

  test('Birmingham 16-17 + socialServices Yes: Children\'s Services duty team framing, St Basil\'s, no SIFA', () => {
    const session = sessionAt('B7_HOMELESS_SLEEPING_SITUATION', {
      ageCategory: '16-17',
      gender: 'Male',
      localAuthority: 'Birmingham',
      supportNeed: 'Emergency Housing',
      homeless: true,
      routeType: 'QUICK',
      socialServices: 'Yes',
    });
    const result = select(session, 3); // Sofa surfing -> terminal
    expect(result.text).toContain('Children\'s Services or a social worker');
    expect(result.text).toContain('duty team');
    expect(result.text).toContain('St Basil');
    expect(result.text).not.toContain('SIFA Fireside');
  });

  test('Sandwell 16-17 + socialServices Yes: Children\'s Services framing, Childline, no navigator orgs', () => {
    const session = sessionAt('B7_HOMELESS_SLEEPING_SITUATION', {
      ageCategory: '16-17',
      gender: 'Male',
      localAuthority: 'Sandwell',
      supportNeed: 'Emergency Housing',
      homeless: true,
      routeType: 'QUICK',
      socialServices: 'Yes',
    });
    const result = select(session, 3); // Sofa surfing -> terminal
    expect(result.text).toContain('Children\'s Services or a social worker');
    expect(result.text).toContain('duty team');
    expect(result.text).toContain('0800 1111');
    expect(result.text).not.toContain('LOCAL SUPPORT');
  });

  test('16-17 + socialServices No: IMPORTANT FOR YOUNG PEOPLE section appears', () => {
    const session = sessionAt('B7_HOMELESS_SLEEPING_SITUATION', {
      ageCategory: '16-17',
      gender: 'Male',
      localAuthority: 'Birmingham',
      supportNeed: 'Emergency Housing',
      homeless: true,
      routeType: 'QUICK',
      socialServices: 'No',
    });
    const result = select(session, 3); // Sofa surfing -> terminal
    expect(result.text).toContain('IMPORTANT FOR YOUNG PEOPLE');
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

  test('female DV exit includes Shelter housing advice link', () => {
    const session = sessionAt('DV_CHILDREN_ASK', { dvGender: 'Female' });
    const result = select(session, 1);
    expect(result.text).toContain('england.shelter.org.uk/housing_advice/homelessness/priority_need/at_risk_of_domestic_abuse');
  });

  test('male DV exit includes Shelter housing advice link', () => {
    const session = sessionAt('DV_CHILDREN_ASK', { dvGender: 'Male' });
    const result = select(session, 1);
    expect(result.text).toContain('england.shelter.org.uk/housing_advice/homelessness/priority_need/at_risk_of_domestic_abuse');
  });

  test('LGBTQ DV exit includes Shelter housing advice link', () => {
    const session = sessionAt('DV_CHILDREN_ASK', { dvGender: 'Non-binary or other' });
    const result = select(session, 1);
    expect(result.text).toContain('england.shelter.org.uk/housing_advice/homelessness/priority_need/at_risk_of_domestic_abuse');
  });

});

// =============================================================================
// SELF-HARM (from crisis gate) - Must show support, not abandon
// =============================================================================

describe('Self-Harm Pathway', () => {

  test('contains Samaritans', () => {
    const session = sessionAt('GATE0_CRISIS_DANGER');
    const result = select(session, 3); // Self-harm is option 3
    expect(result.text).toContain('Samaritans');
  });

  test('contains NHS mental health option', () => {
    const session = sessionAt('GATE0_CRISIS_DANGER');
    const result = select(session, 3);
    expect(result.text).toContain('111');
  });

  test('ends session with safeguarding exit', () => {
    const session = sessionAt('GATE0_CRISIS_DANGER');
    const result = select(session, 3);
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
    const result = select(session, 3); // Self-harm is option 3
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

// =============================================================================
// SUPPORTER MODE - Pronouns render correctly in crisis exits
// =============================================================================

describe('Supporter Mode Exits', () => {

  test('self-harm exit uses third-person pronouns for supporter', () => {
    const session = sessionAt('GATE0_CRISIS_DANGER', { isSupporter: true });
    const result = select(session, 3); // Self-harm
    expect(result.text).toContain('they');
    expect(result.text).toContain('Their feelings');
    expect(result.text).not.toContain('Your feelings');
  });

  test('fire/flood exit uses third-person pronouns for supporter', () => {
    const session = sessionAt('CRISIS_FIRE_FLOOD_LOCATION', { isSupporter: true });
    const result = select(session, 1); // Wolverhampton
    expect(result.text).toContain('their');
    expect(result.text).not.toContain('your home');
  });

});

// =============================================================================
// FIRE/FLOOD - Council phone numbers for specific LAs
// =============================================================================

describe('Fire/Flood Council Numbers', () => {

  test('Wolverhampton shows correct council phone number', () => {
    const session = sessionAt('CRISIS_FIRE_FLOOD_LOCATION');
    const result = select(session, 1); // Wolverhampton
    expect(result.text).toContain('01902 556789');
  });

  test('Birmingham shows correct council phone number', () => {
    const session = sessionAt('CRISIS_FIRE_FLOOD_LOCATION');
    const result = select(session, 2); // Birmingham
    expect(result.text).toContain('0121 303 7410');
  });

});

// =============================================================================
// NON-HOUSING TERMINAL - Food/Health needs produce appropriate output
// =============================================================================

describe('Non-Housing Terminal Path', () => {

  test('Food need produces food support output, not housing', () => {
    const session = sessionAt('B5_PROFILE_CHILDREN', {
      supportNeed: 'Food',
      ageCategory: '25+',
      gender: 'Male',
      lgbtq: false,
      criminalConvictions: 'No',
      publicFunds: 'Yes',
    });
    const result = select(session, 2); // No children -> completes profile -> terminal
    expect(result.text.toLowerCase()).toContain('food');
    // No national fallback for Food — only local services
    expect(result.text.toLowerCase()).not.toContain('council housing');
  });

  test('Health need produces health support output', () => {
    const session = sessionAt('B5_PROFILE_CHILDREN', {
      supportNeed: 'Health',
      ageCategory: '25+',
      gender: 'Female',
      lgbtq: false,
      criminalConvictions: 'No',
      publicFunds: 'Yes',
    });
    const result = select(session, 2); // No children -> completes profile -> terminal
    expect(result.text.toLowerCase()).toContain('health');
    expect(result.text).toContain('nhs.uk');
  });

});

// =============================================================================
// ADVICE SUBCATEGORY ROUTING - Advice bypasses housing profiling
// =============================================================================

describe('Advice Subcategory Routing', () => {

  test('selecting Advice at B5 routes to B5A_ADVICE_TYPE, not housing profiling', () => {
    const session = sessionAt('B5_MAIN_SUPPORT_NEED', {
      routeType: 'FULL',
      localAuthority: 'Birmingham',
    });
    const result = select(session, 5); // Advice is option 5
    expect(result.stateUpdates.currentGate).toBe('B5A_ADVICE_TYPE');
    expect(result.options).toHaveLength(7);
  });

});

// =============================================================================
// DETAILED AGE/GENDER PRIORITY - detailedAge/detailedGender override basics
// =============================================================================

describe('Detailed Age/Gender Fallback', () => {

  test('detailedGender takes priority over gender in user profile', () => {
    const session = sessionAt('GATE0_CRISIS_DANGER', {
      gender: 'Male',
      detailedGender: 'Female',
    });
    const profile = toUserProfile(session);
    expect(profile.gender).toBe('Female');
  });

  test('detailedAge takes priority over ageCategory in user profile', () => {
    const session = sessionAt('GATE0_CRISIS_DANGER', {
      ageCategory: '25+',
      detailedAge: '18-20',
    });
    const profile = toUserProfile(session);
    expect(profile.ageCategory).toBe('18-20');
  });

  test('falls back to basic gender when detailedGender is null', () => {
    const session = sessionAt('GATE0_CRISIS_DANGER', {
      gender: 'Male',
      detailedGender: null,
    });
    const profile = toUserProfile(session);
    expect(profile.gender).toBe('Male');
  });

  test('falls back to basic ageCategory when detailedAge is null', () => {
    const session = sessionAt('GATE0_CRISIS_DANGER', {
      ageCategory: '25+',
      detailedAge: null,
    });
    const profile = toUserProfile(session);
    expect(profile.ageCategory).toBe('25+');
  });

});
