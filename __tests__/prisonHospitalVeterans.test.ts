// Leaving prison, leaving hospital and veterans (Managing Director,
// 20 November 2026; Housing Pathway Endpoints Contract 1.4; Service Matching
// and Questions Design Note, section 2 and 3.3).

import type { SessionState } from '../lib/types';
import { createSession, processInput } from '../lib/stateMachine';
import { getPhrase } from '../lib/phrasebank';
import { runWithServicePool, type ServicePool } from '../lib/data/servicePool';
import { mapProviderRows, mapServiceRow } from '../lib/data/platformMapping';

const REFERRAL_LINE_SELF = 'Some of these take referrals only. If so, the referral comes through your probation officer or the team in the prison that deals with release and housing.';
const REFERRAL_LINE_SUPPORTER = 'Some of these take referrals only. If so, the referral comes through their probation officer or the team in the prison that deals with release and housing.';

function sessionAt(gate: SessionState['currentGate'], profile: Partial<SessionState> = {}): SessionState {
  return { ...createSession('test'), currentGate: gate, ...profile };
}

const adult = (profile: Partial<SessionState> = {}): Partial<SessionState> => ({
  localAuthority: 'Wolverhampton',
  supportNeed: 'Emergency Housing',
  ageCategory: '25 or over',
  routeType: 'QUICK',
  ...profile,
});

// Housing services near the person, as the live read gives them. The V4
// population tags sit in client groups as plain keys.
function housingPool(): ServicePool {
  const svc = (id: string, sub: string, name: string, tags: string[]) => ({
    ...mapServiceRow({
      _id: id, ServiceProviderKey: `org-${id}`, ServiceProviderName: name, Info: `${name} service`,
      ParentCategoryKey: 'housing', SubCategoryKey: sub,
      Address: { Location: { type: 'Point', coordinates: [-2.12, 52.58] } }, distance: 100,
    })!,
    client_groups: tags,
  });
  const services = [
    svc('prison', 'supported-housing', 'Example Resettlement Housing', ['people-with-criminal-records']),
    svc('vets', 'supported-housing', 'Example Veterans Housing', ['veterans']),
    svc('plain', 'emergency-accommodation', 'Example Night Shelter', []),
    svc('adv', 'housing-advice', 'Example Housing Advice', []),
  ];
  return {
    status: 'ready', radiusKm: 5, services,
    contacts: mapProviderRows(services.map(s => ({ Key: s.organization_id, Name: s.name, Telephone: '01902 000200', Website: null }))),
  };
}

const emptyPool = (): ServicePool => ({ status: 'ready', radiusKm: 5, services: [], contacts: {} });

function step(s: SessionState, input: string, pool: ServicePool = housingPool()) {
  const r = runWithServicePool(pool, () => processInput(s, input));
  return { r, s: { ...s, ...r.stateUpdates } as SessionState };
}

function converse(start: SessionState, inputs: string[], pool?: ServicePool) {
  let s = start;
  let r = { text: '', stateUpdates: {} } as ReturnType<typeof processInput>;
  for (const input of inputs) ({ r, s } = step(s, input, pool));
  return { result: r, session: s };
}

// Quick route: answer the housing situation question, then "not in touch with Housing Options".
const quick = (option: string, profile: Partial<SessionState> = {}, pool?: ServicePool) =>
  converse(sessionAt('B6_HOMELESSNESS_STATUS', adult(profile)), [option, '2'], pool).result.text;

// Full route from the "already supported" question to the consent screen and on.
const toConsent = (situation: SessionState['housingSituation'], profile: Partial<SessionState> = {}) =>
  sessionAt('C2_CONSENT_GATE', adult({ routeType: 'FULL', housingSituation: situation, homeless: true, ...profile }));

// Full route answers after the armed forces question: British, no children,
// male, ethnicity, physical health and mental health not stated or none,
// no convictions, not LGBTQ+. Ends at the results for someone aged 25 or over.
const AFTER_ARMED_FORCES = ['1', '2', '1', '7', '7', '1', '1', '2'];

const PROMISES = [/\bduty\b/i, / must /i, / will (refer|help|house|find|give|get|provide|offer)/i, /\bentitled\b/i, /\bguarantee/i];

describe('someone leaving prison', () => {
  test('sees local services for people leaving prison first, with the referral line, then Housing Options', () => {
    const text = quick('4');
    expect(text).toContain('SERVICES FOR PEOPLE LEAVING PRISON');
    expect(text).toContain('Example Resettlement Housing');
    expect(text).toContain(REFERRAL_LINE_SELF);
    expect(text.indexOf('SERVICES FOR PEOPLE LEAVING PRISON')).toBeLessThan(text.indexOf('YOUR FIRST STEP'));
    expect(text).toContain('Explain what\'s happening and ask for a homelessness assessment.');
    expect(text).toContain('If you\'re still in prison, you can ask the staff there to refer you to this team.');
    expect(text).toContain('Shelter');
  });

  test('is not offered StreetLink', () => {
    const text = quick('4');
    expect(text).not.toContain('StreetLink');
    expect(text).not.toContain('OUTREACH SUPPORT');
  });

  test('the prison section holds only services tagged for people with criminal records', () => {
    const text = quick('4');
    const section = text.slice(text.indexOf('SERVICES FOR PEOPLE LEAVING PRISON'), text.indexOf('YOUR FIRST STEP'));
    expect(section).not.toContain('Example Veterans Housing');
    expect(section).not.toContain('Example Night Shelter');
  });

  test('where no local service is tagged, there is no prison section and no referral line', () => {
    const text = quick('4', {}, emptyPool());
    expect(text).not.toContain('SERVICES FOR PEOPLE LEAVING PRISON');
    expect(text).not.toContain('referrals only');
    expect(text).toContain('YOUR FIRST STEP');
  });

  test('a supporter is told the referral comes through their probation officer', () => {
    const text = quick('4', { isSupporter: true });
    expect(text).toContain(REFERRAL_LINE_SUPPORTER);
    expect(text).toContain('If they\'re still in prison, they can ask the staff there to refer them to this team.');
  });

  test('the staff line names the council\'s housing team once', () => {
    const text = quick('4');
    expect(text.split('council\'s housing team').length - 1).toBe(1);
  });
});

describe('a 17 year old leaving prison', () => {
  const seventeen = { ageCategory: '16-17', socialServices: 'No', youthSocialServicesAsked: true };

  test('is told the referral comes through their youth justice worker, not a probation officer', () => {
    const text = quick('4', seventeen);
    expect(text).toContain('Some of these take referrals only. If so, the referral comes through your youth justice worker or the team in the prison that deals with release and housing.');
    expect(text).not.toContain('probation officer');
  });

  test('a supporter is told it comes through their youth justice worker', () => {
    expect(quick('4', { ...seventeen, isSupporter: true })).toContain('the referral comes through their youth justice worker or the team in the prison');
  });

  test('an adult is still told it comes through their probation officer', () => {
    const text = quick('4');
    expect(text).toContain('your probation officer');
    expect(text).not.toContain('youth justice worker');
  });

  test.each([['4', 'prison'], ['5', 'hospital']])('with a social worker, answer %s still shows the staff referral line', (option, place) => {
    const text = quick(option as string, { ...seventeen, socialServices: 'Yes' });
    expect(text).toContain(`If you're still in ${place}, you can ask the staff there to refer you to this team.`);
  });
});

describe('someone leaving hospital', () => {
  test('sees Housing Options and is told the hospital staff can refer them', () => {
    const text = quick('5');
    expect(text).toContain('YOUR FIRST STEP');
    expect(text).toContain('Explain what\'s happening and ask for a homelessness assessment.');
    expect(text).toContain('If you\'re still in hospital, you can ask the staff there to refer you to this team.');
    expect(text).toContain('Shelter');
  });

  test('is not offered StreetLink, and sees no prison services', () => {
    const text = quick('5');
    expect(text).not.toContain('StreetLink');
    expect(text).not.toContain('SERVICES FOR PEOPLE LEAVING PRISON');
    expect(text).not.toContain('Example Resettlement Housing');
  });

  test('a supporter is told the hospital staff can refer the person', () => {
    expect(quick('5', { isSupporter: true })).toContain('If they\'re still in hospital, they can ask the staff there to refer them to this team.');
  });
});

describe('the armed forces question', () => {
  test('asks plainly, with Yes, No and Prefer not to say', () => {
    expect(getPhrase('ARMED_FORCES_ASK', false)?.text).toContain('Have you ever served in the armed forces?');
    expect(getPhrase('ARMED_FORCES_ASK', true)?.text).toContain('Have they ever served in the armed forces?');
    expect(getPhrase('ARMED_FORCES_ASK', false)?.options).toEqual(['Yes', 'No', 'Prefer not to say']);
  });

  test.each([
    ['LOSING_HOME'], ['STAYING_SOMEWHERE'], ['LEAVING_PRISON'], ['LEAVING_HOSPITAL'], ['NOWHERE_TONIGHT'],
  ])('is asked in the crisis housing conversation (%s), after consent and before immigration', situation => {
    const { r, s } = step(toConsent(situation as SessionState['housingSituation']), '1');
    expect(r.stateUpdates.currentGate).toBe('ARMED_FORCES_ASK');
    expect(r.text).toContain('Have you ever served in the armed forces?');
    expect(step(s, '1').r.stateUpdates.currentGate).toBe('C3Q1_IMMIGRATION_STATUS');
  });

  test.each([['2'], ['3'], ['4'], ['5'], ['6']])('is not asked on the quick route (answer %s), which goes straight to the results', option => {
    const { result } = converse(sessionAt('B6_HOMELESSNESS_STATUS', adult()), [option, '2']);
    expect(result.stateUpdates.currentGate).toBe('TERMINAL_ADDITIONAL_NEEDS');
    expect(result.text).not.toContain('armed forces');
  });

  test('is not asked of a 16 or 17 year old', () => {
    for (const age of [{ ageCategory: '16-17' }, { ageCategory: '16-17', detailedAge: '16-17' }]) {
      const { r } = step(toConsent('STAYING_SOMEWHERE', age), '1');
      expect(r.stateUpdates.currentGate).toBe('C3Q1_IMMIGRATION_STATUS');
      expect(r.text).not.toContain('armed forces');
    }
  });

  test('is not asked of someone keeping things steady', () => {
    // Their route goes to the prevention questions, not the consent screen ...
    const first = step(sessionAt('B6_HOMELESSNESS_STATUS', adult({ routeType: 'FULL' })), '1');
    expect(step(first.s, '2').r.stateUpdates.currentGate).toBe('B7B_PREVENTION_REASON');
    // ... and the consent screen would not ask it of them either.
    expect(step(toConsent('KEEP_STEADY'), '1').r.stateUpdates.currentGate).toBe('C3Q1_IMMIGRATION_STATUS');
  });

  test('is not asked when the answers are skipped at the consent screen', () => {
    const { r } = step(toConsent('STAYING_SOMEWHERE'), '2');
    expect(r.stateUpdates.currentGate).toBe('TERMINAL_ADDITIONAL_NEEDS');
    expect(r.text).not.toContain('armed forces');
  });

  test.each([['1', true], ['2', false], ['3', null]])('answer %s is kept with the profile', (option, value) => {
    const { s } = step(toConsent('STAYING_SOMEWHERE'), '1');
    expect(step(s, option as string).r.stateUpdates.servedInArmedForces).toBe(value);
  });
});

describe('a veteran', () => {
  const resultsAfter = (answer: string, profile: Partial<SessionState> = {}) =>
    converse(toConsent('STAYING_SOMEWHERE', profile), ['1', answer, ...AFTER_ARMED_FORCES]).result;

  test('saying yes sees Op FORTITUDE under its own heading, local services for veterans, and Housing Options', () => {
    const result = resultsAfter('1');
    expect(result.stateUpdates.currentGate).toBe('TERMINAL_ADDITIONAL_NEEDS');
    const text = result.text;
    expect(text).toContain('SUPPORT FOR VETERANS');
    expect(text).toContain('Op FORTITUDE\n0800 9520 774\nhttps://www.gov.uk/support-for-veterans/op-fortitude\nThe government-backed referral route for veterans who are homeless or at risk of homelessness. You can contact them yourself.');
    expect(text).toContain('Example Veterans Housing');
    expect(text).toContain('YOUR FIRST STEP');
    expect(text).toContain('Explain what\'s happening and ask for a homelessness assessment.');
  });

  test('sees Op FORTITUDE even where no local service is tagged for veterans', () => {
    const text = converse(toConsent('STAYING_SOMEWHERE'), ['1', '1', ...AFTER_ARMED_FORCES], emptyPool()).result.text;
    expect(text).toContain('Op FORTITUDE');
    expect(text).not.toContain('Example Veterans Housing');
  });

  test('a supporter is told the person can contact Op FORTITUDE themselves', () => {
    const text = resultsAfter('1', { isSupporter: true }).text;
    expect(text).toContain('They can contact Op FORTITUDE themselves.');
    expect(text).not.toContain('You can contact them yourself.');
  });

  test.each([['2'], ['3']])('answer %s (No, or Prefer not to say) shows no Op FORTITUDE and no services for veterans', answer => {
    const text = resultsAfter(answer).text;
    expect(text).not.toContain('Op FORTITUDE');
    expect(text).not.toContain('SUPPORT FOR VETERANS');
    expect(text).not.toContain('Example Veterans Housing');
  });
});

describe('someone about to lose their home', () => {
  test('sees local housing advice from an old-key service list', () => {
    const oldPool = (): ServicePool => {
      const services = ['housing', 'legal'].map((sub, i) => mapServiceRow({
        _id: `old${i}`, ServiceProviderKey: `org-old${i}`, ServiceProviderName: `Old Key Advice ${sub}`,
        Info: `${sub} advice`, ParentCategoryKey: 'support', SubCategoryKey: sub,
        Address: { Location: { type: 'Point', coordinates: [-2.12, 52.58] } }, distance: 100,
      })!);
      return { status: 'ready', radiusKm: 5, services, contacts: {} };
    };
    const text = quick('2', {}, oldPool());
    const section = text.slice(text.indexOf('LOCAL HOUSING ADVICE'));
    expect(text).toContain('LOCAL HOUSING ADVICE');
    expect(section).toContain('Old Key Advice housing');
    expect(section).toContain('Old Key Advice legal');
  });

  test('sees local housing advice from the fixed service file', () => {
    const s = sessionAt('B6_HOMELESSNESS_STATUS', adult());
    const first = processInput(s, '2');
    const text = processInput({ ...s, ...first.stateUpdates } as SessionState, '2').text;
    expect(text).toContain('LOCAL HOUSING ADVICE');
  });

  test('sees local housing advice from a V4-keyed service list, from V4 Housing, Advice', () => {
    const text = quick('2');
    expect(text).toContain('LOCAL HOUSING ADVICE');
    const section = text.slice(text.indexOf('LOCAL HOUSING ADVICE'));
    expect(section).toContain('Example Housing Advice');
    expect(section).not.toContain('Example Night Shelter');
  });
});

describe('safeguarding order is unchanged', () => {
  test('under 16 is still option 2 at the crisis question, for the person and for a supporter', () => {
    for (const supporter of [false, true]) {
      const options = getPhrase('GATE0_CRISIS_DANGER', supporter)?.options || [];
      expect(options[1]).toMatch(/under 16/i);
    }
  });
});

describe('the results make no promises', () => {
  const results: [string, string][] = [
    ['leaving prison', quick('4')],
    ['leaving prison, supporter', quick('4', { isSupporter: true })],
    ['leaving hospital', quick('5')],
    ['leaving hospital, supporter', quick('5', { isSupporter: true })],
    ['veteran', converse(toConsent('STAYING_SOMEWHERE'), ['1', '1', ...AFTER_ARMED_FORCES]).result.text],
    ['veteran, supporter', converse(toConsent('STAYING_SOMEWHERE', { isSupporter: true }), ['1', '1', ...AFTER_ARMED_FORCES]).result.text],
  ];
  test.each(results)('%s: no duty, must, entitlement or promise wording', (_label, text) => {
    for (const p of PROMISES) expect(p.test(text)).toBe(false);
  });
});
