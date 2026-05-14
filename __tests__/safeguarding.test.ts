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
import {
  createSession,
  getFirstMessage,
  processInput,
  detectUnder16Age,
  interceptUnder16Age,
} from '../lib/stateMachine';
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

  test('option 4 contains "Domestic abuse" (routing depends on array index)', () => {
    const session = createSession('test');
    const result = getFirstMessage(session);
    expect(result.options?.[3]).toContain('Domestic abuse');
  });

  test('option 5 contains "Sexual violence" (routing depends on array index)', () => {
    const session = createSession('test');
    const result = getFirstMessage(session);
    expect(result.options?.[4]).toContain('Sexual violence');
  });

  test('option 7 (none) proceeds to LOCATION_CONSENT', () => {
    const session = sessionAt('GATE0_CRISIS_DANGER');
    const result = select(session, 7);
    expect(result.stateUpdates.currentGate).toBe('LOCATION_CONSENT');
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
    const session = sessionAt('B3_AGE_CATEGORY', { localAuthority: 'Birmingham' });
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

  test('PROFESSIONAL user does not see NSPCC adult helpline or warm sign-off', () => {
    // Per v1.1 §1.4: NSPCC adult helpline is for non-professionals worried
    // about a child; professionals call Children's Services directly. Warm
    // sign-off is inappropriate register for the professional context.
    const session = sessionAt('B3_AGE_CATEGORY', {
      localAuthority: 'Birmingham',
      userType: 'PROFESSIONAL',
      isSupporter: true,
    });
    const result = select(session, 1);
    expect(result.text).not.toContain('0808 800 5000'); // NSPCC number
    expect(result.text).not.toContain('Please reach out when you feel ready');
    // But still gets the professional opener and the 999 line
    expect(result.text).toContain("Here are the Children's Services contacts");
    expect(result.text).toContain('999');
  });

});

// =============================================================================
// Crisis gate option 2 — safeguarding state set before LA prompt (PR #19)
// =============================================================================

describe('Crisis gate option 2', () => {

  test('GATE0 option 2 sets safeguardingTriggered and safeguardingType before LA prompt', () => {
    const session = sessionAt('GATE0_CRISIS_DANGER');
    const result = select(session, 2);
    expect(result.stateUpdates.currentGate).toBe('CRISIS_UNDER16_LOCATION');
    expect(result.stateUpdates.safeguardingTriggered).toBe(true);
    expect(result.stateUpdates.safeguardingType).toBe('UNDER_16');
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

  test('DV __PROFESSIONAL exit fires when userType is PROFESSIONAL', () => {
    // Per v1.1 §3.1: professional register replaces consolation framing
    // with direct service framing.
    const session = sessionAt('DV_CHILDREN_ASK', {
      dvGender: 'Female',
      isSupporter: true,
      userType: 'PROFESSIONAL',
    });
    const result = select(session, 1);
    expect(result.text).toContain('Here are the specialist contacts');
    expect(result.text).toContain("You'll know your next steps from here");
    expect(result.text).not.toContain("You don't have to work this out on your own");
    // Service contacts and 999 line still present
    expect(result.text).toContain('0808 2000 247');
    expect(result.text).toContain('999');
  });

});

// =============================================================================
// SEXUAL VIOLENCE - Must route to SA exit with appropriate helplines and 999
// =============================================================================

describe('Sexual Violence Disclosure', () => {

  test('SA __SUPPORTER exits include the 999 line (behavioural change per v1.1)', () => {
    // Pre-v1.1 SA exits did not include a 999 line. v1.1 adds one to every
    // safeguarding exit. Locking in the behavioural change so a regression
    // can't silently remove it.
    const session = sessionAt('SA_GENDER_ASK', {
      isSupporter: true,
      userType: 'SUPPORTER',
    });
    const result = select(session, 1); // Female
    expect(result.text).toContain("If they're in immediate danger, call 999");
  });

  test('SA __PROFESSIONAL exit fires when userType is PROFESSIONAL', () => {
    const session = sessionAt('SA_GENDER_ASK', {
      isSupporter: true,
      userType: 'PROFESSIONAL',
    });
    const result = select(session, 1); // Female
    expect(result.text).toContain('Here are the specialist contacts');
    expect(result.text).toContain("You'll know your next steps from here");
    expect(result.text).not.toContain("You don't have to work this out on your own");
    // Service contact and 999 line still present
    expect(result.text).toContain('0808 500 2222');
    expect(result.text).toContain('999');
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

  test('SELF_HARM_EXIT__PROFESSIONAL resolves and uses direct register', () => {
    // Note: buildSelfHarmExit (crisis.ts) is still inline and does not yet
    // source from the SELF_HARM_EXIT phrasebank entries. This test asserts
    // selector resolution only — the entry's pathway wiring is pending.
    const entry = getPhrase('SELF_HARM_EXIT', 'PROFESSIONAL');
    expect(entry?.text).toContain('Here are the immediate support contacts');
    expect(entry?.text).toContain("You'll know what to do from here");
    expect(entry?.text).toContain('A&E');
    // Selector falls back through __PROFESSIONAL → __SUPPORTER → base.
    // Confirm the PROFESSIONAL variant fired (not the SUPPORTER fallback).
    expect(entry?.text).not.toContain("You don't have to work this out on your own");
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

  test('zero-match scenario emits NO_SUITABLE_PATHWAY in session state', () => {
    const session = sessionAt('B5_PROFILE_CHILDREN', {
      supportNeed: 'Food',
      localAuthority: 'NowhereTestLA',
      ageCategory: '25+',
      gender: 'Male',
      lgbtq: false,
      criminalConvictions: 'No',
      publicFunds: 'Yes',
    });
    const result = select(session, 2); // No children -> terminal
    expect(result.stateUpdates.terminalOutcome).toBe('NO_SUITABLE_PATHWAY');
  });

});

// =============================================================================
// DV PREGNANCY PATH - Pregnancy wording in DV children question
// =============================================================================

describe('DV Pregnancy Path', () => {

  test('DV children question includes pregnancy wording', () => {
    const phrase = getPhrase('DV_CHILDREN_ASK', false);
    expect(phrase?.text?.toLowerCase()).toContain('pregnant');
  });

  test('answering yes to DV children question routes to children-specific exit', () => {
    const session = sessionAt('DV_CHILDREN_ASK', { dvGender: 'Female' });
    const result = select(session, 1); // Yes (children or pregnant)
    // Children-specific exit contains the helpline and housing advice
    expect(result.text).toContain('0808 2000 247');
    expect(result.text).toContain('Shelter');
  });

});

// =============================================================================
// NRPF FAMILY SUPPORT - Section 17 framing for NRPF users with children
// =============================================================================

describe('NRPF Family Support', () => {

  test('NRPF user with children reaches Section 17 framing in terminal', () => {
    const session = sessionAt('B5_PROFILE_CHILDREN', {
      supportNeed: 'Emergency Housing',
      localAuthority: 'Birmingham',
      ageCategory: '25+',
      gender: 'Female',
      lgbtq: false,
      criminalConvictions: 'No',
      publicFunds: 'No',
      homeless: true,
    });
    const result = select(session, 1); // Yes, has children
    expect(result.text).toContain('Children\'s Services');
    expect(result.text).toContain('FAMILY & IMMIGRATION SUPPORT');
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

// =============================================================================
// IMMIGRATION STATUS DERIVES PUBLIC FUNDS
// =============================================================================

describe('Immigration Status Derives Public Funds', () => {

  test('British/Irish citizen derives publicFunds = Yes', () => {
    const session = sessionAt('IMMIGRATION_STATUS_ASK', {
      supportNeed: 'Emergency Housing',
      ageCategory: '25+',
      gender: 'Male',
      lgbtq: false,
      criminalConvictions: 'No',
      localAuthority: 'Birmingham',
      homeless: true,
    });
    const result = select(session, 1); // British/Irish
    expect(result.stateUpdates.currentGate).not.toBe('IMMIGRATION_STATUS_ASK');
    expect(result.stateUpdates.immigrationStatus).toBe('British');
    expect(result.stateUpdates.publicFunds).toBe('Yes');
  });

  test('NRPF leave to remain derives publicFunds = No', () => {
    const session = sessionAt('IMMIGRATION_STATUS_ASK', {
      supportNeed: 'Emergency Housing',
      ageCategory: '25+',
      gender: 'Male',
      lgbtq: false,
      criminalConvictions: 'No',
      localAuthority: 'Birmingham',
      homeless: true,
    });
    const result = select(session, 5); // LTR no public funds
    expect(result.stateUpdates.currentGate).not.toBe('IMMIGRATION_STATUS_ASK');
    expect(result.stateUpdates.immigrationStatus).toBe('Leave to remain');
    expect(result.stateUpdates.publicFunds).toBe('No');
  });

  test('asylum seeker derives publicFunds = No', () => {
    const session = sessionAt('IMMIGRATION_STATUS_ASK', {
      supportNeed: 'Emergency Housing',
      ageCategory: '25+',
      gender: 'Female',
      lgbtq: false,
      criminalConvictions: 'No',
      localAuthority: 'Birmingham',
      homeless: true,
    });
    const result = select(session, 8); // Asylum seeker
    expect(result.stateUpdates.currentGate).not.toBe('IMMIGRATION_STATUS_ASK');
    expect(result.stateUpdates.immigrationStatus).toBe('Asylum seeker');
    expect(result.stateUpdates.publicFunds).toBe('No');
  });

  test('pre-settled status derives publicFunds = Not sure', () => {
    const session = sessionAt('IMMIGRATION_STATUS_ASK', {
      supportNeed: 'Emergency Housing',
      ageCategory: '25+',
      gender: 'Male',
      lgbtq: false,
      criminalConvictions: 'No',
      localAuthority: 'Birmingham',
      homeless: true,
    });
    const result = select(session, 7); // EU pre-settled
    expect(result.stateUpdates.currentGate).not.toBe('IMMIGRATION_STATUS_ASK');
    expect(result.stateUpdates.immigrationStatus).toBe('EUSS');
    expect(result.stateUpdates.publicFunds).toBe('Not sure');
  });

  test('prefer not to say derives publicFunds = null', () => {
    const session = sessionAt('IMMIGRATION_STATUS_ASK', {
      supportNeed: 'Emergency Housing',
      ageCategory: '25+',
      gender: 'Male',
      lgbtq: false,
      criminalConvictions: 'No',
      localAuthority: 'Birmingham',
      homeless: true,
    });
    const result = select(session, 10); // Prefer not to say
    expect(result.stateUpdates.currentGate).not.toBe('IMMIGRATION_STATUS_ASK');
  });

});

// =============================================================================
// LGBTQ+ SPECIALIST FOLLOW-UP
// =============================================================================

describe('LGBTQ+ Specialist Follow-up', () => {

  test('answering Yes to LGBTQ routes to LGBTQ_SPECIALIST_ASK, not next profile question', () => {
    const session = sessionAt('B5_PROFILE_LGBTQ', {
      supportNeed: 'Emergency Housing',
      ageCategory: '25+',
      gender: 'Female',
    });
    const result = select(session, 1); // Yes, LGBTQ+
    expect(result.stateUpdates.currentGate).toBe('LGBTQ_SPECIALIST_ASK');
    expect(result.stateUpdates.lgbtq).toBe(true);
  });

  test('answering No to LGBTQ sets lgbtq false and skips specialist ask', () => {
    const session = sessionAt('B5_PROFILE_LGBTQ', {
      supportNeed: 'Emergency Housing',
      ageCategory: '25+',
      gender: 'Male',
      localAuthority: 'Birmingham',
      homeless: true,
    });
    const result = select(session, 2); // No
    expect(result.stateUpdates.currentGate).not.toBe('B5_PROFILE_LGBTQ');
    expect(result.stateUpdates.currentGate).not.toBe('LGBTQ_SPECIALIST_ASK');
    expect(result.stateUpdates.lgbtq).toBe(false);
  });

  test('answering Prefer not to say to LGBTQ sets lgbtq null and skips specialist ask', () => {
    const session = sessionAt('B5_PROFILE_LGBTQ', {
      supportNeed: 'Emergency Housing',
      ageCategory: '25+',
      gender: 'Female',
      localAuthority: 'Birmingham',
      homeless: true,
    });
    const result = select(session, 3); // Prefer not to say
    expect(result.stateUpdates.currentGate).not.toBe('B5_PROFILE_LGBTQ');
    expect(result.stateUpdates.currentGate).not.toBe('LGBTQ_SPECIALIST_ASK');
    expect(result.stateUpdates.lgbtq).toBeNull();
  });

});

// =============================================================================
// NULL-CHECK GATE FIX - Fields initialized to null must use == null
// =============================================================================

describe('Null-Check Gate Fix', () => {

  test('lgbtq: false does not re-trigger LGBTQ question', () => {
    const session = sessionAt('B5_PROFILE_CONVICTIONS', {
      supportNeed: 'Emergency Housing',
      ageCategory: '25+',
      gender: 'Male',
      lgbtq: false,
      localAuthority: 'Birmingham',
      homeless: true,
    });
    const result = select(session, 2); // No convictions
    // Should proceed past convictions, not loop back to LGBTQ
    expect(result.stateUpdates.currentGate).not.toBe('B5_PROFILE_LGBTQ');
  });

  test('hasChildren: false does not re-trigger children question', () => {
    const session = sessionAt('IMMIGRATION_STATUS_ASK', {
      supportNeed: 'Emergency Housing',
      ageCategory: '25+',
      gender: 'Male',
      lgbtq: false,
      criminalConvictions: 'No',
      hasChildren: false,
      localAuthority: 'Birmingham',
      homeless: true,
    });
    const result = select(session, 1); // British/Irish
    // Should go to terminal, not re-ask children
    expect(result.stateUpdates.currentGate).not.toBe('B5_PROFILE_CHILDREN');
  });

  test('PNTS through B5_PROFILE_CHILDREN does not re-trigger (regression)', () => {
    const session = sessionAt('B5_PROFILE_CHILDREN', {
      supportNeed: 'Financial',
      ageCategory: '25+',
      localAuthority: 'Birmingham',
      immigrationStatus: 'British',
      publicFunds: 'Yes',
    });
    const result = select(session, 3); // Prefer not to say
    expect(result.stateUpdates.currentGate).not.toBe('B5_PROFILE_CHILDREN');
  });

});

// =============================================================================
// HOUSING OPTIONS INVOLVEMENT - Routes from B6, stores involvement, advances to B7
// =============================================================================

describe('Housing Options Involvement', () => {

  test('B6_HOMELESSNESS_STATUS routes to HOUSING_OPTIONS_INVOLVEMENT_ASK', () => {
    const session = sessionAt('B6_HOMELESSNESS_STATUS');
    const result = select(session, 1); // Yes, homeless
    expect(result.stateUpdates.currentGate).toBe('HOUSING_OPTIONS_INVOLVEMENT_ASK');
  });

  test('B6 option 2 (not homeless) also routes to HOUSING_OPTIONS_INVOLVEMENT_ASK', () => {
    const session = sessionAt('B6_HOMELESSNESS_STATUS');
    const result = select(session, 2); // No, not homeless
    expect(result.stateUpdates.currentGate).toBe('HOUSING_OPTIONS_INVOLVEMENT_ASK');
  });

  test('presents Yes, No, Not sure options', () => {
    const phrase = getPhrase('HOUSING_OPTIONS_INVOLVEMENT_ASK', false);
    expect(phrase?.options).toEqual(['Yes', 'No', 'Not sure']);
  });

  test('option 1 (Yes) stores housingOptionsInvolvement as true', () => {
    const session = sessionAt('HOUSING_OPTIONS_INVOLVEMENT_ASK', { homeless: true });
    const result = select(session, 1);
    expect(result.stateUpdates.housingOptionsInvolvement).toBe(true);
  });

  test('option 2 (No) stores housingOptionsInvolvement as false', () => {
    const session = sessionAt('HOUSING_OPTIONS_INVOLVEMENT_ASK', { homeless: true });
    const result = select(session, 2);
    expect(result.stateUpdates.housingOptionsInvolvement).toBe(false);
  });

  test('option 3 (Not sure) stores housingOptionsInvolvement as null', () => {
    const session = sessionAt('HOUSING_OPTIONS_INVOLVEMENT_ASK', { homeless: true });
    const result = select(session, 3);
    expect(result.stateUpdates.housingOptionsInvolvement).toBeNull();
  });

  test('homeless user advances to B7_HOMELESS_SLEEPING_SITUATION', () => {
    const session = sessionAt('HOUSING_OPTIONS_INVOLVEMENT_ASK', { homeless: true });
    const result = select(session, 1); // Yes
    expect(result.stateUpdates.currentGate).toBe('B7_HOMELESS_SLEEPING_SITUATION');
  });

  test('non-homeless user advances to B7_HOUSED_SITUATION', () => {
    const session = sessionAt('HOUSING_OPTIONS_INVOLVEMENT_ASK', { homeless: false });
    const result = select(session, 2); // No
    expect(result.stateUpdates.currentGate).toBe('B7_HOUSED_SITUATION');
  });

  test('supporter variant uses third-person phrasing', () => {
    const phrase = getPhrase('HOUSING_OPTIONS_INVOLVEMENT_ASK', true);
    expect(phrase?.text).toContain('they');
  });

});

// =============================================================================
// MID-CONVERSATION UNDER-16 DETECTION
// Detects explicit first-person disclosure of under-16 age at any gate
// and routes to the safeguarding exit, even if the user previously declared
// an adult age at B3_AGE_CATEGORY.
// =============================================================================

describe('Mid-Conversation Under-16 Detection', () => {

  describe('Numeric age triggers (10-15)', () => {
    const cases: Array<[number, string]> = [
      [10, "I'm 10"],
      [11, "I am 11"],
      [12, "im 12"],
      [13, "I'm 13"],
      [14, "I am 14"],
      [15, "I'm 15"],
    ];

    test.each(cases)('age %i (%s) triggers AGE_NUMERIC escalation', (age, phrase) => {
      const result = detectUnder16Age(phrase);
      expect(result.triggered).toBe(true);
      if (result.triggered) {
        expect(result.type).toBe('AGE_NUMERIC');
        expect(result.code).toBe(`AGE_NUMERIC_${age}`);
      }
    });

    test('age 16 does not trigger', () => {
      expect(detectUnder16Age("I'm 16").triggered).toBe(false);
    });
  });

  describe('School year triggers (Year 7-10)', () => {
    const cases: Array<[number, string]> = [
      [7, "I'm in Year 7"],
      [8, "year 8"],
      [9, "I'm in Year 9"],
      [10, "yr 10"],
    ];

    test.each(cases)('Year %i (%s) triggers SCHOOL_YEAR escalation', (year, phrase) => {
      const result = detectUnder16Age(phrase);
      expect(result.triggered).toBe(true);
      if (result.triggered) {
        expect(result.type).toBe('SCHOOL_YEAR');
        expect(result.code).toBe(`SCHOOL_YEAR_${year}`);
      }
    });

    test('Year 11 does not trigger', () => {
      expect(detectUnder16Age("I'm in Year 11").triggered).toBe(false);
    });
  });

  describe('Ambiguous phrases do not trigger', () => {
    test.each([
      "I'm young",
      "still at school",
      "my mum won't let me",
      "I'm in trouble with my parents",
    ])('"%s" does not trigger', (phrase) => {
      expect(detectUnder16Age(phrase).triggered).toBe(false);
    });
  });

  describe('Contextual qualifier does not suppress trigger', () => {
    test('"I\'m 14 but asking for my mum" still triggers', () => {
      const result = detectUnder16Age("I'm 14 but asking for my mum");
      expect(result.triggered).toBe(true);
      if (result.triggered) {
        expect(result.code).toBe('AGE_NUMERIC_14');
      }
    });
  });

  describe('Mid-conversation interception', () => {
    test('triggers regardless of prior B3 age gate selection', () => {
      // User has already passed B3 declaring 25+ — trigger must still fire mid-flow.
      // No LA set, so intercept routes to CRISIS_UNDER16_LOCATION (asks for area).
      const session = sessionAt('B7_HOMELESS_SLEEPING_SITUATION', {
        ageCategory: '25 or over',
        homeless: true,
      });
      const result = interceptUnder16Age(session, "I'm 14");
      expect(result).not.toBeNull();
      expect(result?.stateUpdates?.currentGate).toBe('CRISIS_UNDER16_LOCATION');
      expect(result?.stateUpdates?.safeguardingType).toBe('UNDER_16');
    });

    test('session terminates on trigger when LA is set', () => {
      const session = sessionAt('B5_PROFILE_GENDER', {
        ageCategory: '25 or over',
        localAuthority: 'Birmingham',
      });
      const result = interceptUnder16Age(session, "I'm in year 9");
      expect(result?.sessionEnded).toBe(true);
      expect(result?.stateUpdates?.currentGate).toBe('SESSION_END');
    });

    test('routes to CRISIS_UNDER16_LOCATION on trigger when LA is not set', () => {
      const session = sessionAt('B5_PROFILE_GENDER', { ageCategory: '25 or over' });
      const result = interceptUnder16Age(session, "I'm in year 9");
      expect(result).not.toBeNull();
      expect(result?.sessionEnded).toBeUndefined();
      expect(result?.stateUpdates?.currentGate).toBe('CRISIS_UNDER16_LOCATION');
    });

    test('intercept fires at GATE0_CRISIS_DANGER before any classifier would run', () => {
      // "I'm 14" at the crisis gate must hit the safeguarding intercept,
      // not checkScope or detectAdviceQuestion (which are async Claude calls).
      // The intercept is a pure synchronous function — if it returns non-null
      // at GATE0, the classifier is never reached in route.ts.
      const session = sessionAt('GATE0_CRISIS_DANGER');
      const result = interceptUnder16Age(session, "I'm 14");
      expect(result).not.toBeNull();
      expect(result?.stateUpdates?.currentGate).toBe('CRISIS_UNDER16_LOCATION');
      expect(result?.stateUpdates?.safeguardingType).toBe('UNDER_16');
    });

    test('non-trigger input returns null (does not intercept)', () => {
      const session = sessionAt('B5_PROFILE_GENDER');
      expect(interceptUnder16Age(session, "I'm 25")).toBeNull();
    });
  });

  describe('Audit logging', () => {
    let logSpy: jest.SpyInstance;

    beforeEach(() => {
      logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
      logSpy.mockRestore();
    });

    test('captures trigger type, trigger code, session ID, timestamp — and does not capture raw user text', () => {
      const session = sessionAt('B5_PROFILE_GENDER');
      session.sessionId = 'test-session-abc-123';
      const sentinel = 'XYZZY_SECRET_PHRASE_42';

      interceptUnder16Age(session, `I'm 14 and ${sentinel}`);

      // Find the safeguarding-trigger log call
      const safeguardingCalls = logSpy.mock.calls.filter(
        (c) => typeof c[0] === 'string' && c[0].includes('SAFEGUARDING_TRIGGER')
      );
      expect(safeguardingCalls.length).toBeGreaterThan(0);

      const payload = JSON.parse(safeguardingCalls[0][1]);
      expect(payload.type).toBe('AGE_NUMERIC');
      expect(payload.code).toBe('AGE_NUMERIC_14');
      expect(payload.sessionId).toBe('test-session-abc-123');
      expect(payload.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(payload.event).toBe('UNDER_16_DETECTED');
      expect(payload.pathwayChange).toBe('TERMINATED_TO_UNDER_16_EXIT');

      // Verify NO log call across the whole spy contains the raw user text
      const allLogText = JSON.stringify(logSpy.mock.calls);
      expect(allLogText).not.toContain(sentinel);
    });
  });

});
