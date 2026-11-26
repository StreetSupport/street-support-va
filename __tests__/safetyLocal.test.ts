// The Safety from harm results screen (Managing Director, 20 November 2026):
// matched local V4 Safety from harm listings, read live with the same cap and
// fixed-file fallback as housing, alongside the contacts already shown on the
// same screen; and, for 16 and 17 year olds, the local Children's Services.
// No database: every read is a pool built here.

import type { SessionState } from '../lib/types';
import { createSession, processInput, interceptUnder16Age } from '../lib/stateMachine';
import { runWithServicePool, type ServicePool } from '../lib/data/servicePool';
import { mapProviderRows, mapServiceRow, type PlatformServiceRow } from '../lib/data/platformMapping';
import { poolForTurn, readsLiveAt, SAFETY_RESULT_GATES } from '../lib/data/liveReadGates';
import { FIRST_OPTIONS } from '../lib/data/v4Categories';
import { QUICK_EXIT_NOTE } from '../lib/phrasebank';

const row = (id: string, sub: string, info = `Listing ${id} description`, parent = 'safety-from-harm'): PlatformServiceRow => ({
  _id: id,
  ServiceProviderKey: `org-${id}`,
  ServiceProviderName: `Listing ${id}`,
  Info: info,
  ParentCategoryKey: parent,
  SubCategoryKey: sub,
  IsAppointmentOnly: false,
  IsTelephoneService: false,
  ClientGroupKeys: [],
  Address: { Location: { type: 'Point', coordinates: [-1.51, 52.41] } },
  distance: 100,
});

function poolOf(rows: PlatformServiceRow[]): ServicePool {
  const services = rows.map(r => mapServiceRow(r)!);
  return {
    status: 'ready',
    radiusKm: 5,
    services,
    contacts: mapProviderRows(services.map(s => ({ Key: s.organization_id, Name: s.name, Telephone: '024 0000 0000', Website: null }))),
  };
}

const LIVE = () => poolOf([
  row('da', 'domestic-abuse'),
  row('sv', 'sexual-violence'),
  row('ms', 'modern-slavery-and-trafficking'),
  row('sw', ''), // sex work services sit in the parent with no subcategory
  row('house', 'housing-advice', 'Housing advice', 'housing'),
]);
const EMPTY = (): ServicePool => ({ status: 'ready', radiusKm: 5, services: [], contacts: {} });
const FAILED = (): ServicePool => ({ status: 'unavailable' });

const onRoute = (p: Partial<SessionState> = {}): Partial<SessionState> => ({
  localAuthority: 'Coventry', latitude: 52.41, longitude: -1.51,
  v4Option: 'safety', supportNeed: 'V4:safety', ...p,
});

const sessionAt = (gate: SessionState['currentGate'], p: Partial<SessionState> = {}): SessionState =>
  ({ ...createSession('test'), currentGate: gate, ...p });

function walk(inputs: string[], pool: ServicePool | null, p: Partial<SessionState> = {}) {
  let s = sessionAt('SAFETY_TYPE_OF_HARM', onRoute(p));
  let r = { text: '', stateUpdates: {} } as ReturnType<typeof processInput>;
  for (const input of inputs) {
    r = runWithServicePool(pool, () => processInput(s, input));
    s = { ...s, ...r.stateUpdates } as SessionState;
  }
  return r;
}

// Harm options: 1 to 3 domestic abuse, 4 sexual violence, 5 and 6 modern
// slavery, 7 something else. Then 1 OK to carry on, 2 show me help now.
const DA_NOW = ['1', '2'], SV_NOW = ['4', '2'], MS = ['5', '1'], OTHER = ['7', '2'];

const NATIONAL_DA = 'National Domestic Violence Helpline';
const LOCAL_DA = 'LOCAL DOMESTIC ABUSE SUPPORT';
const COVENTRY_CS = "Coventry Children's Services\n024 7678 8555 (out of hours: 024 7683 2222)\nhttps://www.coventry.gov.uk/childrens-services";

describe('local listings on the Safety results screen', () => {
  test('domestic abuse, help now: the local domestic abuse listings, below every contact already shown, before how to leave quickly', () => {
    const text = walk(DA_NOW, LIVE()).text;
    const at = (t: string) => text.indexOf(t);
    expect(at('call 999')).toBeLessThan(at(NATIONAL_DA));
    for (const t of [NATIONAL_DA, 'ManKind Initiative', 'Galop', LOCAL_DA, 'Shelter - Domestic Violence Advice', 'LOCAL SERVICES', 'Listing da', QUICK_EXIT_NOTE]) {
      expect([t, at(t) >= 0]).toEqual([t, true]);
    }
    expect(at('Shelter - Domestic Violence Advice')).toBeLessThan(at('LOCAL SERVICES'));
    expect(at('Listing da')).toBeLessThan(at(QUICK_EXIT_NOTE));
    expect(text).not.toContain('Listing sv');
    expect(text).not.toContain('Listing house');
  });

  test('sexual violence, help now: the sexual violence listings, after the SARC', () => {
    const text = walk(SV_NOW, LIVE()).text;
    expect(text.indexOf('LOCAL SEXUAL ASSAULT REFERRAL CENTRE')).toBeLessThan(text.indexOf('Listing sv'));
    expect(text).not.toContain('Listing da');
  });

  test('modern slavery: the modern slavery listings, after both national lines', () => {
    const text = walk(MS, LIVE()).text;
    expect(text.indexOf('MODERN SLAVERY AND EXPLOITATION')).toBeLessThan(text.indexOf('Listing ms'));
    expect(text).not.toContain('Listing da');
  });

  test('something else: every Safety from harm listing, including those with no subcategory, and no others', () => {
    const text = walk(OTHER, LIVE()).text;
    for (const id of ['da', 'sv', 'ms', 'sw']) expect(text).toContain(`Listing ${id}`);
    expect(text).not.toContain('Listing house');
  });

  test('domestic abuse, OK to carry on: the crisis gate flow, then its exit shows the listings too', () => {
    const text = walk(['1', '1', '1', '2'], LIVE()).text; // female, no children
    expect(text).toContain(NATIONAL_DA);
    expect(text).toContain('Listing da');
    expect(text).toContain(QUICK_EXIT_NOTE);
  });

  test('sexual violence, OK to carry on: the crisis gate flow, then the listings', () => {
    const text = walk(['4', '1', '4'], LIVE()).text; // prefer not to say
    expect(text).toContain('SurvivorsUK');
    expect(text).toContain('LOCAL SEXUAL ASSAULT REFERRAL CENTRE');
    expect(text).toContain('Listing sv');
  });

  test('the same flows from the crisis gate are unchanged, even with services read', () => {
    let s = sessionAt('GATE0_CRISIS_DANGER', { localAuthority: 'Coventry' });
    for (const input of ['4', '1']) { const r = processInput(s, input); s = { ...s, ...r.stateUpdates } as SessionState; }
    const fromGate = runWithServicePool(LIVE(), () => processInput(s, '2')).text;
    const fixed = processInput(s, '2').text;
    expect(fromGate).toBe(fixed);
    expect(fromGate).not.toContain('LOCAL SERVICES');
  });

  test('only a stated restriction hides a listing: women-only is hidden for a stated Male, and shown otherwise', () => {
    const pool = () => poolOf([row('w', 'domestic-abuse', 'Women only refuge and support.'), row('any', 'domestic-abuse')]);
    const male = walk(['1', '1', '2', '2'], pool()).text;
    expect(male).toContain('Listing any');
    expect(male).not.toContain('Listing w\n');
    for (const gender of ['1', '3', '4']) {
      expect(walk(['1', '1', gender, '2'], pool()).text).toContain('Listing w\n');
    }
    expect(walk(DA_NOW, pool()).text).toContain('Listing w\n');
  });

  test('five or fewer, one per organisation', () => {
    const many = poolOf(Array.from({ length: 8 }, (_, i) => row(`d${i}`, 'domestic-abuse')));
    const text = walk(DA_NOW, many).text;
    expect((text.match(/Listing d\d\n024/g) || []).length).toBe(5);
  });

  test.each([['failed', FAILED], ['empty', EMPTY], ['not read', () => null]])(
    'a %s read: every contact still shows, and no local listings section', (_l, pool) => {
      for (const inputs of [DA_NOW, SV_NOW, MS, OTHER]) {
        const withRead = walk(inputs, pool()).text;
        expect(withRead).not.toContain('LOCAL SERVICES');
        expect(withRead).toBe(walk(inputs, null).text);
      }
      const da = walk(DA_NOW, pool()).text;
      for (const t of ['call 999', NATIONAL_DA, LOCAL_DA, QUICK_EXIT_NOTE]) expect(da).toContain(t);
      expect(walk(SV_NOW, pool()).text).toContain('LOCAL SEXUAL ASSAULT REFERRAL CENTRE');
      expect(walk(MS, pool()).text).toContain('MODERN SLAVERY REFERRAL HELPLINE');
    });

  test('supporter: the listings, introduced the same way', () => {
    const text = walk(DA_NOW, LIVE(), { isSupporter: true, userType: 'SUPPORTER' }).text;
    expect(text).toContain('If they are in immediate danger, call 999.');
    expect(text).toContain('These local services also work with people in this situation.');
    expect(text).toContain('Listing da');
  });
});

describe('which Safety turns read', () => {
  const at = (gate: SessionState['currentGate'], p: Partial<SessionState> = {}) => sessionAt(gate, onRoute(p));
  const calls = (s: SessionState, input: string) => {
    let n = 0;
    poolForTurn(s, input, () => { n++; return Promise.resolve(EMPTY()); });
    return n;
  };

  test('the answer that shows the Safety results reads once', () => {
    for (const harm of ['DOMESTIC_ABUSE', 'SEXUAL_VIOLENCE', 'MODERN_SLAVERY', 'OTHER'] as const) {
      expect(calls(at('SAFETY_OK_TO_CONTINUE', { safetyHarm: harm }), '2')).toBe(1);
    }
    expect(calls(at('SAFETY_OK_TO_CONTINUE', { safetyHarm: 'MODERN_SLAVERY' }), '1')).toBe(1);
    expect(calls(at('DV_CHILDREN_ASK', { safetyHarm: 'DOMESTIC_ABUSE' }), '2')).toBe(1);
    expect(calls(at('SA_GENDER_ASK', { safetyHarm: 'SEXUAL_VIOLENCE' }), '1')).toBe(1);
  });

  test('a turn that asks the next question never reads', () => {
    expect(calls(at('SAFETY_OK_TO_CONTINUE', { safetyHarm: 'DOMESTIC_ABUSE' }), '1')).toBe(0);
    expect(calls(at('SAFETY_OK_TO_CONTINUE', { safetyHarm: 'SEXUAL_VIOLENCE' }), '1')).toBe(0);
    expect(calls(at('SAFETY_TYPE_OF_HARM'), '1')).toBe(0);
    expect(calls(at('DV_GENDER_ASK', { safetyHarm: 'DOMESTIC_ABUSE' }), '1')).toBe(0);
    expect(calls(at('SAFETY_OK_TO_CONTINUE', { safetyHarm: 'DOMESTIC_ABUSE' }), 'help')).toBe(0);
  });

  test('every Safety result turn that reads shows the results', () => {
    for (const gate of SAFETY_RESULT_GATES) for (const harm of ['DOMESTIC_ABUSE', 'SEXUAL_VIOLENCE', 'MODERN_SLAVERY', 'OTHER'] as const) for (const input of ['1', '2', '3', '4']) {
      const s = at(gate as SessionState['currentGate'], { safetyHarm: harm });
      if (readsLiveAt(s, input)) expect([gate, harm, input, processInput(s, input).sessionEnded]).toEqual([gate, harm, input, true]);
    }
  });

  test('choosing Safety from harm at the first question never reads', () => {
    const safety = String(FIRST_OPTIONS.findIndex(o => o.id === 'safety') + 1);
    expect(calls(at('B5_MAIN_SUPPORT_NEED', { v4Option: null }), safety)).toBe(0);
  });

  test('the immediate danger exit never reads', () => {
    const s = at('GATE0_CRISIS_DANGER', { v4Option: null });
    expect(calls(s, '1')).toBe(0);
    expect(processInput(s, '1').stateUpdates.safeguardingType).toBe('IMMEDIATE_DANGER');
  });

  test('the under-16 exits never read', () => {
    expect(calls(at('GATE0_CRISIS_DANGER', { v4Option: null }), '2')).toBe(0);
    expect(calls(at('CRISIS_UNDER16_LOCATION', { safetyHarm: 'DOMESTIC_ABUSE' }), '3')).toBe(0);
    expect(calls(at('B5_PROFILE_AGE', { supportNeed: 'Emergency Housing', v4Option: 'housing' }), '1')).toBe(0);
  });

  test('an under-16 age typed on the Safety route takes the under-16 exit, which the chat route runs before any read', () => {
    const exit = interceptUnder16Age(at('SAFETY_OK_TO_CONTINUE', { safetyHarm: 'DOMESTIC_ABUSE' }), "I'm 14");
    expect(exit?.stateUpdates.safeguardingType).toBe('UNDER_16');
    expect(exit?.text).not.toContain('LOCAL SERVICES');
  });

  test('the crisis gate flows never read', () => {
    expect(calls(at('DV_CHILDREN_ASK', { v4Option: null, safetyHarm: null }), '2')).toBe(0);
    expect(calls(at('SA_GENDER_ASK', { v4Option: null, safetyHarm: null }), '1')).toBe(0);
  });
});

describe("16 and 17: Children's Services on the Safety route", () => {
  test.each([['domestic abuse', DA_NOW], ['sexual violence', SV_NOW], ['modern slavery', MS], ['something else', OTHER]])(
    '%s: the local Children\'s Services, with out of hours', (_l, inputs) => {
      const text = walk(inputs, null, { ageCategory: '16-17' }).text;
      expect(text).toContain("CHILDREN'S SERVICES\nFor people aged 16 or 17, Children's Services can help with staying safe. You can call their duty team directly, or ask someone you trust to help you make contact.");
      expect(text).toContain(COVENTRY_CS);
    });

  test('after the OK to carry on flow too', () => {
    expect(walk(['1', '1', '1', '2'], null, { ageCategory: '16-17' }).text).toContain(COVENTRY_CS);
  });

  test('even when the read fails', () => {
    expect(walk(DA_NOW, FAILED(), { ageCategory: '16-17' }).text).toContain(COVENTRY_CS);
  });

  test('supporter wording', () => {
    const text = walk(DA_NOW, null, { ageCategory: '16-17', isSupporter: true, userType: 'SUPPORTER' }).text;
    expect(text).toContain('They can call their duty team directly, or ask someone they trust to help them make contact.');
    expect(text).toContain(COVENTRY_CS);
  });

  test('adults, and anyone whose age is not known, see no Children\'s Services section', () => {
    expect(walk(DA_NOW, null, { ageCategory: '25+' }).text).not.toContain("CHILDREN'S SERVICES");
    expect(walk(DA_NOW, null).text).not.toContain("CHILDREN'S SERVICES");
  });
});
