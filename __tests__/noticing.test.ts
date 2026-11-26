// The noticing step: Service Matching and Questions Design Note v1.1, 3.5
// (wording, Managing Director, 8 November 2026).

import type { SessionState } from '../lib/types';
import { createSession, processInput } from '../lib/stateMachine';
import { runWithServicePool, type ServicePool } from '../lib/data/servicePool';
import { mapProviderRows, mapServiceRow } from '../lib/data/platformMapping';
import { noticingLeadsToResults, noticingOptions, parseNoticing } from '../lib/noticing';

function sessionAt(gate: SessionState['currentGate'], over: Partial<SessionState> = {}): SessionState {
  return { ...createSession('test'), currentGate: gate, localAuthority: 'Wolverhampton', routeType: 'QUICK', ...over };
}

const row = (id: string, parent: string, sub: string) => ({
  _id: id, ServiceProviderKey: `org-${id}`, ServiceProviderName: `Org ${id}`, Info: `Service ${id}`,
  ParentCategoryKey: parent, SubCategoryKey: sub, IsAppointmentOnly: false, IsTelephoneService: false,
  Address: { Location: { type: 'Point', coordinates: [-2.12, 52.58] as [number, number] } }, distance: 100,
});
function pool(): ServicePool {
  const rows = [row('hot', 'food', 'hot-meals'), row('debt', 'finance', 'debt-and-money-management')];
  return {
    status: 'ready', radiusKm: 5,
    services: rows.map(r => mapServiceRow(r)!),
    contacts: mapProviderRows(rows.map(r => ({ Key: r.ServiceProviderKey, Name: r.ServiceProviderName, Telephone: null, Website: null }))),
  } as ServicePool;
}

/** Walk from the first question to the noticing step: option, second-screen choice, profile questions. */
function toNoticing(option: string, choice: string, over: Partial<SessionState> = {}): SessionState {
  let s = sessionAt('B5_MAIN_SUPPORT_NEED', over);
  s = { ...s, ...processInput(s, option).stateUpdates };
  s = { ...s, ...processInput(s, choice).stateUpdates };
  for (let i = 0; i < 10 && s.currentGate !== 'B5_NOTICING' && !String(s.currentGate).startsWith('TERMINAL'); i++) {
    s = { ...s, ...processInput(s, s.currentGate === 'B5_PROFILE_AGE' ? '4' : '2').stateUpdates };
  }
  return s;
}
const answer = (s: SessionState, input: string) => runWithServicePool(pool(), () => processInput(s, input));
const optionNumber = (s: SessionState, label: string) => String(noticingOptions(s).indexOf(label) + 1);

describe('Noticing step: who is asked, and what they see', () => {
  test('someone wanting a hot meal is asked what else is putting pressure on them before their results', () => {
    const s = toNoticing('3', '1');
    expect(s.currentGate).toBe('B5_NOTICING');
  });

  test('someone with a debt question is asked too, after their profile questions', () => {
    expect(toNoticing('4', '1').currentGate).toBe('B5_NOTICING');
  });

  test('someone asking about their mental health is asked too', () => {
    expect(toNoticing('5', '1').currentGate).toBe('B5_NOTICING');
  });

  test('the question uses the approved wording', () => {
    let s = sessionAt('B5_MAIN_SUPPORT_NEED');
    s = { ...s, ...processInput(s, '3').stateUpdates };
    const r = processInput(s, '1'); // A hot meal: no profile questions
    // Design note 3.5, Managing Director, 8 November 2026; Feeling unsafe
    // first, Managing Director, 26 November 2026
    expect(r.text.startsWith('Thanks. Sometimes one thing is tied up with others. Is anything else putting pressure on you at the moment?')).toBe(true);
    expect(r.options).toEqual([
      'Feeling unsafe', 'Money, work or bills', "Health, including how I'm feeling", 'Family or relationships', 'Drink, drugs or gambling',
      'Keeping my home or paying rent', "I don't have a settled place to live", 'Nothing else', "I'm not sure",
      'Just show me food near me',
    ]);
  });

  test('someone who came about money is not offered money as another pressure', () => {
    const opts = noticingOptions(toNoticing('4', '1'));
    expect(opts).not.toContain('Money, work or bills');
    expect(opts).toContain("Health, including how I'm feeling");
  });

  test('someone who came about gambling is not offered drink, drugs or gambling, but is offered health', () => {
    const opts = noticingOptions(toNoticing('5', '5'));
    expect(opts).not.toContain('Drink, drugs or gambling');
    expect(opts).toContain("Health, including how I'm feeling");
  });

  test('someone who came about mental health is not offered health again', () => {
    const opts = noticingOptions(toNoticing('5', '1'));
    expect(opts).not.toContain("Health, including how I'm feeling");
  });

  test('someone who came about a physical or sexual health need can still say how they are feeling', () => {
    expect(noticingOptions(toNoticing('5', '2'))).toContain("Health, including how I'm feeling");
    expect(noticingOptions(toNoticing('5', '3'))).toContain("Health, including how I'm feeling");
  });

  test('someone who came about something else in health can still say how they are feeling, but not drink, drugs or gambling', () => {
    const opts = noticingOptions(toNoticing('5', '6'));
    expect(opts).toContain("Health, including how I'm feeling");
    expect(opts).not.toContain('Drink, drugs or gambling');
  });

  test('someone who came about food can decline with "Just show me food near me"', () => {
    const opts = noticingOptions(toNoticing('3', '1'));
    expect(opts[opts.length - 1]).toBe('Just show me food near me');
  });

  test('someone asking about immigration is not asked, and goes to results', () => {
    let s = sessionAt('B5_MAIN_SUPPORT_NEED');
    s = { ...s, ...processInput(s, '6').stateUpdates };
    const gates: string[] = [];
    for (let i = 0; i < 10 && !String(s.currentGate).startsWith('TERMINAL'); i++) {
      gates.push(s.currentGate);
      s = { ...s, ...processInput(s, s.currentGate === 'B5_PROFILE_AGE' ? '4' : '2').stateUpdates };
    }
    expect(gates).not.toContain('B5_NOTICING');
  });

  test('someone asking for toiletries or period products sees where to get them first, with no question, then one offer', () => {
    let s = sessionAt('B5_MAIN_SUPPORT_NEED');
    s = { ...s, ...processInput(s, '3').stateUpdates };
    let r = processInput(s, '4'); // Toiletries or period products
    s = { ...s, ...r.stateUpdates };
    for (let i = 0; i < 8 && !String(s.currentGate).startsWith('TERMINAL'); i++) {
      expect(s.currentGate).not.toBe('B5_NOTICING');
      r = processInput(s, '2');
      s = { ...s, ...r.stateUpdates };
    }
    expect(String(s.currentGate).startsWith('TERMINAL')).toBe(true);
    // Design note 3.7
    expect(r.text).toContain('If you need somewhere to stay tonight, or other help, I can help with that too.');
  });

  test('someone asking for clothes sees where to get them first, with no question, then one offer', () => {
    let s = sessionAt('B5_MAIN_SUPPORT_NEED');
    s = { ...s, ...processInput(s, '3').stateUpdates };
    let r = processInput(s, '3'); // Clothes, counted as emergency clothing (19 November)
    s = { ...s, ...r.stateUpdates };
    for (let i = 0; i < 8 && !String(s.currentGate).startsWith('TERMINAL'); i++) {
      expect(s.currentGate).not.toBe('B5_NOTICING');
      r = processInput(s, '2');
      s = { ...s, ...r.stateUpdates };
    }
    expect(String(s.currentGate).startsWith('TERMINAL')).toBe(true);
    expect(r.text).toContain('If you need somewhere to stay tonight, or other help, I can help with that too.');
  });

  test('someone asking for a phone or getting online is asked, since communications is not dignity provision', () => {
    expect(toNoticing('3', '5').currentGate).toBe('B5_NOTICING');
  });

  test('a supporter is not asked, because the wording is in the first person, and gets results', () => {
    const s = toNoticing('3', '1', { isSupporter: true, userType: 'SUPPORTER' });
    expect(s.currentGate).not.toBe('B5_NOTICING');
    expect(String(s.currentGate).startsWith('TERMINAL')).toBe(true);
  });
});

describe('Noticing step: what follows the answer', () => {
  test('declining with the skip shows the results they came for, and nothing about other pressures', () => {
    const s = toNoticing('3', '1');
    const r = answer(s, 'Just show me food near me');
    expect(r.text).toContain('Org hot');
    expect(r.text).not.toContain('Thanks for telling me');
  });

  test('someone who names another pressure hears the awareness line, then their results', () => {
    const s = toNoticing('3', '1');
    const r = answer(s, optionNumber(s, 'Money, work or bills'));
    expect(r.text).toContain('Thanks for telling me.');
    expect(r.text).toContain("Here's help with a hot meal.");
    expect(r.text.indexOf('Thanks for telling me.')).toBeLessThan(r.text.indexOf('Org hot'));
  });

  test('someone who names several pressures by number is read correctly', () => {
    const s = toNoticing('3', '1');
    const a = optionNumber(s, 'Money, work or bills');
    const b = optionNumber(s, 'Family or relationships');
    const r = answer(s, `${a} and ${b}`);
    expect(r.text).toContain('Thanks for telling me.');
    expect(r.text).toContain('Org hot');
    // the second number counts too
    const r2 = answer(s, `${b} and ${optionNumber(s, 'Feeling unsafe')}`);
    expect(r2.stateUpdates.currentGate).toBe('SAFETY_TYPE_OF_HARM');
  });

  test('the awareness line is not shown when local services cannot be loaded, since there is no help listed to speak to', () => {
    const s = toNoticing('3', '1');
    const r = runWithServicePool({ status: 'unavailable' } as ServicePool, () => processInput(s, optionNumber(s, 'Money, work or bills')));
    expect(r.text).toContain("can't load local");
    expect(r.text).not.toContain('Thanks for telling me');
  });

  test('"nothing else" shows the results without the awareness line', () => {
    const s = toNoticing('4', '1');
    const r = answer(s, 'Nothing else');
    expect(r.text).toContain('Org debt');
    expect(r.text).not.toContain('Thanks for telling me');
  });

  test('someone who says they feel unsafe goes to the Safety from harm route, never the matcher', () => {
    const s = toNoticing('3', '1');
    const r = answer(s, optionNumber(s, 'Feeling unsafe'));
    expect(r.stateUpdates.currentGate).toBe('SAFETY_TYPE_OF_HARM');
    expect(r.text).not.toContain('Org hot');
  });

  test('while the Safety route is switched off, "Feeling unsafe" goes to the crisis question, never the matcher', () => {
    const s = toNoticing('3', '1');
    process.env.VA_SAFETY_ROUTE = 'off';
    try {
      const r = answer(s, optionNumber(s, 'Feeling unsafe'));
      expect(r.stateUpdates.currentGate).toBe('GATE0_CRISIS_DANGER');
      expect(r.options).toEqual(expect.arrayContaining(['Immediate physical danger', 'Domestic abuse', 'Sexual violence']));
      expect(r.text).not.toContain('Org hot');
    } finally {
      process.env.VA_SAFETY_ROUTE = 'on';
    }
  });

  test('someone without a settled place to live sees their results first, then is offered housing as a choice', () => {
    const s = toNoticing('3', '1');
    const r = answer(s, optionNumber(s, "I don't have a settled place to live"));
    expect(r.text).toContain('Org hot');
    expect(r.text).toContain("You also mentioned that you don't have a settled place to live. Would you like to look at housing support too?");
    expect(r.text.indexOf('Org hot')).toBeLessThan(r.text.indexOf('You also mentioned'));
    expect(r.options).toEqual(['Look at housing support', 'Stay with these results']);
    expect(r.stateUpdates.currentGate).toBe('B5_HOUSING_OFFER');
  });

  test('someone worried about keeping their home sees their results first, then the offer in their own terms', () => {
    const s = toNoticing('4', '1');
    const r = answer(s, optionNumber(s, 'Keeping my home or paying rent'));
    expect(r.text).toContain('Org debt');
    expect(r.text).toContain('You also mentioned that keeping your home or paying rent is putting pressure on you. Would you like to look at housing support too?');
  });

  test('feeling unsafe comes first, even alongside a housing answer', () => {
    const s = toNoticing('4', '1');
    const r = answer(s, `${optionNumber(s, "I don't have a settled place to live")}, ${optionNumber(s, 'Feeling unsafe')}`);
    expect(r.stateUpdates.currentGate).toBe('SAFETY_TYPE_OF_HARM');
  });

  test('choosing to look at housing support goes on to the housing route, asking age where it is not known', () => {
    let s = toNoticing('3', '1');
    s = { ...s, ...answer(s, optionNumber(s, "I don't have a settled place to live")).stateUpdates };
    const r = processInput(s, 'Look at housing support');
    expect(r.stateUpdates.supportNeed).toBe('Emergency Housing');
    expect(r.stateUpdates.currentGate).toBe('B5_PROFILE_AGE'); // the food route asks no age
  });

  test('someone whose age is already known goes straight on to the housing questions', () => {
    let s = toNoticing('4', '1'); // the debt route asks age
    expect(s.ageCategory).toBe('25+');
    s = { ...s, ...answer(s, optionNumber(s, 'Keeping my home or paying rent')).stateUpdates };
    expect(processInput(s, '1').stateUpdates.currentGate).toBe('B6_HOMELESSNESS_STATUS');
  });

  test('choosing to stay with the results is asked whether anything else is needed, so there is always a next step', () => {
    let s = toNoticing('3', '1');
    s = { ...s, ...answer(s, optionNumber(s, "I don't have a settled place to live")).stateUpdates };
    const r = processInput(s, 'Stay with these results');
    expect(r.stateUpdates.currentGate).toBe('TERMINAL_ADDITIONAL_NEEDS');
    expect(r.stateUpdates.supportNeed).toBeUndefined();
  });

  test('someone under 16 who chooses housing support from the offer reaches the children\'s services exit', () => {
    let s = toNoticing('3', '1');
    s = { ...s, ...answer(s, optionNumber(s, "I don't have a settled place to live")).stateUpdates };
    s = { ...s, ...processInput(s, 'Look at housing support').stateUpdates };
    expect(s.currentGate).toBe('B5_PROFILE_AGE');
    const r = processInput(s, 'Under 16');
    expect(r.stateUpdates.currentGate).toBe('SESSION_END');
    expect(r.stateUpdates.safeguardingType).toBe('UNDER_16');
  });

  test('when local services cannot be loaded, the person is told so and is still offered housing support', () => {
    const s = toNoticing('3', '1');
    const r = runWithServicePool({ status: 'unavailable' } as ServicePool,
      () => processInput(s, optionNumber(s, "I don't have a settled place to live")));
    expect(r.text).toContain('Would you like to look at housing support too?');
    expect(r.options).toEqual(['Look at housing support', 'Stay with these results']);
    expect(r.stateUpdates.currentGate).toBe('B5_HOUSING_OFFER');
  });

  test('choosing housing from the offer counts as a further need', () => {
    let s = toNoticing('3', '1');
    s = { ...s, ...answer(s, optionNumber(s, "I don't have a settled place to live")).stateUpdates };
    const r = processInput(s, 'Look at housing support');
    expect(r.stateUpdates.needCount).toBe(s.needCount + 1);
  });

  test('an unclear answer to the housing offer asks once more, then moves on', () => {
    let s = toNoticing('3', '1');
    s = { ...s, ...answer(s, optionNumber(s, "I don't have a settled place to live")).stateUpdates };
    const r1 = processInput(s, 'maybe later');
    expect(r1.stateUpdates.currentGate).toBe('B5_HOUSING_OFFER');
    s = { ...s, ...r1.stateUpdates };
    expect(processInput(s, 'not sure').stateUpdates.currentGate).toBe('TERMINAL_ADDITIONAL_NEEDS');
  });

  test('an unclear answer asks once more, then shows the results, so no one is held here', () => {
    const s = toNoticing('3', '1');
    const r1 = answer(s, 'my landlord is being difficult');
    expect(r1.stateUpdates.currentGate).toBe('B5_NOTICING');
    expect(r1.text.startsWith("I didn't quite catch that.")).toBe(true);
    const s2 = { ...s, ...r1.stateUpdates };
    const r2 = answer(s2, 'still not sure what to say');
    expect(r2.text).toContain('Org hot');
  });

  test("an unclear answer points to 'Feeling unsafe' and 999 (review of #73)", () => {
    const s = toNoticing('3', '1');
    const r1 = answer(s, 'my partner is hurting me');
    expect(r1.text).toContain("If you feel unsafe, choose 'Feeling unsafe'. If you are in danger right now, call 999.");
    expect(noticingOptions(s)).toContain('Feeling unsafe');
  });

  test('a second unclear answer shows the 999 line above the results', () => {
    const s = toNoticing('3', '1');
    const s2 = { ...s, ...answer(s, 'hmm').stateUpdates };
    const r2 = answer(s2, 'still not sure');
    expect(r2.text.startsWith('If you are in danger right now, call 999.')).toBe(true);
    expect(r2.text).toContain('Org hot');
  });

  test('supporters are told about them, not you', () => {
    const s = { ...toNoticing('3', '1'), isSupporter: true };
    expect(s.currentGate).toBe('B5_NOTICING');
    const r1 = answer(s, 'not sure how to put it');
    expect(r1.text).toContain("If they feel unsafe, choose 'Feeling unsafe'. If they are in danger right now, call 999.");
    const r2 = answer({ ...s, ...r1.stateUpdates }, 'hmm');
    expect(r2.text.startsWith('If they are in danger right now, call 999.')).toBe(true);
  });

  test('typed words are never read as a pressure by keyword', () => {
    const s = toNoticing('3', '1');
    const r = answer(s, 'I feel unsafe at home');
    expect(r.stateUpdates.currentGate).toBe('B5_NOTICING');
  });

  test('the step is offered once: a second need later in the conversation goes straight to results', () => {
    let s = toNoticing('3', '1');
    expect(s.noticingAsked).toBe(true);
    s = { ...s, ...answer(s, 'Just show me food near me').stateUpdates };
    expect(s.currentGate).toBe('TERMINAL_ADDITIONAL_NEEDS');
    s = { ...s, ...processInput(s, '1').stateUpdates }; // Yes, another need
    const gates: string[] = [];
    const route = ['4', '1'];
    for (let i = 0; i < 12 && !(String(s.currentGate).startsWith('TERMINAL') && gates.length > 0); i++) {
      gates.push(s.currentGate);
      const pick = route.length && s.currentGate.startsWith('B5_') && !s.currentGate.startsWith('B5_PROFILE') ? route.shift()! : s.currentGate === 'B5_PROFILE_AGE' ? '4' : '2';
      s = { ...s, ...processInput(s, pick).stateUpdates };
    }
    expect(gates).toContain('B5_SECOND_SCREEN');
    expect(gates).not.toContain('B5_NOTICING');
    expect(String(s.currentGate).startsWith('TERMINAL')).toBe(true);
  });
});

describe('Noticing step: reading the answer', () => {
  const opts = ['A', 'B', 'C', 'D'];
  test.each([['1', [1]], ['1.', [1]], ['1 and 3', [1, 3]], ['3, 1', [1, 3]], ['2 4', [2, 4]], ['b', [2]]])('"%s" reads as the options chosen', (input: string, want: number[]) => {
    expect(parseNoticing(input, opts)).toEqual(want);
  });
  test.each([[''], ['5'], ['0'], ['1 and maybe 2'], ['some of it']])('"%s" is unclear', (input: string) => {
    expect(parseNoticing(input, opts)).toBeNull();
  });
});

describe('Noticing step: local services are read only when results follow', () => {
  test('choosing "Feeling unsafe" never waits on the database', () => {
    const s = toNoticing('3', '1');
    expect(noticingLeadsToResults(s, optionNumber(s, 'Feeling unsafe'))).toBe(false);
  });
  test('a housing answer reads local services, because their results come first', () => {
    const s = toNoticing('3', '1');
    expect(noticingLeadsToResults(s, optionNumber(s, "I don't have a settled place to live"))).toBe(true);
  });
  test('the skip, another pressure, or a second unclear answer reads local services', () => {
    const s = toNoticing('3', '1');
    expect(noticingLeadsToResults(s, 'Just show me food near me')).toBe(true);
    expect(noticingLeadsToResults(s, optionNumber(s, 'Family or relationships'))).toBe(true);
    expect(noticingLeadsToResults(s, 'hmm')).toBe(false);
    expect(noticingLeadsToResults({ ...s, unclearCount: 1 }, 'hmm')).toBe(true);
  });
});

describe('Noticing step: choosing more than one (design paper, Part C, 3.5)', () => {
  const asked = () => {
    let s = sessionAt('B5_MAIN_SUPPORT_NEED');
    s = { ...s, ...processInput(s, '3').stateUpdates };
    return processInput(s, '1'); // A hot meal: no profile questions
  };

  test('the question says more than one can be chosen (Managing Director, 26 November 2026)', () => {
    expect(asked().text).toContain('You can choose more than one.');
  });

  test('it tells the chat window that several answers can be chosen, and which answer on their own', () => {
    const r = asked();
    const opts = r.options ?? [];
    const alone = (r.multiSelect?.exclusive ?? []).map(n => opts[n - 1]);
    expect(alone).toEqual(['Nothing else', "I'm not sure", 'Just show me food near me']);
  });

  test('the unclear answer asks again with the same control', () => {
    const s = { ...sessionAt('B5_MAIN_SUPPORT_NEED'), ...asked().stateUpdates } as SessionState;
    const again = processInput({ ...s, v4Option: 'everyday', v4Choice: 'A hot meal' }, 'not a number');
    expect(again.multiSelect?.exclusive.length).toBe(3);
  });

  test('ticked answers arrive as the chat window sends them, "1, 3"', () => {
    expect(parseNoticing('2, 4', ['a', 'b', 'c', 'd'])).toEqual([2, 4]);
  });
});
