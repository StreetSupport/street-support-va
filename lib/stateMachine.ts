import { getPhrase, PhraseEntry } from './phrasebank';

export type Gate = 
  | 'INIT' | 'GATE0_CRISIS_DANGER' | 'DV_GENDER_ASK' | 'DV_CHILDREN_ASK'
  | 'GATE1_INTENT' | 'GATE2_ROUTE_SELECTION'
  | 'B1_LOCAL_AUTHORITY' | 'B2_WHO_FOR' | 'B3_AGE_CATEGORY' | 'B5_MAIN_SUPPORT_NEED'
  | 'B6_HOMELESSNESS_STATUS' | 'B7_HOUSED_SITUATION' | 'B7_HOMELESS_SLEEPING_SITUATION'
  | 'B7A_PREVENTION_GATE' | 'TERMINAL_ADDITIONAL_NEEDS' | 'SESSION_END';

export interface SessionState {
  sessionId: string;
  currentGate: Gate;
  routeType: 'QUICK' | 'FULL' | null;
  localAuthority: string | null;
  jurisdiction: 'ENGLAND' | 'SCOTLAND';
  userType: 'SELF' | 'SUPPORTER' | null;
  ageCategory: string | null;
  gender: string | null;
  supportNeed: string | null;
  homeless: boolean | null;
  sleepingSituation: string | null;
  housedSituation: string | null;
  preventionNeed: string | null;
  hasChildren: boolean | null;
  isSupporter: boolean;
  unclearCount: number;
  safeguardingTriggered: boolean;
  safeguardingType: string | null;
  timestampStart: string;
}

export interface RoutingResult {
  text: string;
  options?: string[];
  sessionEnded: boolean;
  stateUpdates: Partial<SessionState>;
}

export function createSession(sessionId: string): SessionState {
  return {
    sessionId, currentGate: 'INIT', routeType: null, localAuthority: null,
    jurisdiction: 'ENGLAND', userType: null, ageCategory: null, gender: null,
    supportNeed: null, homeless: null, sleepingSituation: null, housedSituation: null,
    preventionNeed: null, hasChildren: null, isSupporter: false, unclearCount: 0,
    safeguardingTriggered: false, safeguardingType: null,
    timestampStart: new Date().toISOString(),
  };
}

export function parseUserInput(input: string, options?: string[]): number | null {
  const num = parseInt(input.trim(), 10);
  if (!isNaN(num) && num >= 1 && num <= (options?.length || 12)) return num;
  if (options) {
    const lower = input.toLowerCase();
    for (let i = 0; i < options.length; i++) {
      if (options[i].toLowerCase().includes(lower) || lower.includes(options[i].toLowerCase().split(' ')[0])) {
        return i + 1;
      }
    }
  }
  return null;
}

export function getFirstMessage(session: SessionState): RoutingResult {
  const opening = getPhrase('OPENING_LINE', false);
  const langHint = getPhrase('LANG_HINT_LINE', false);
  const crisis = getPhrase('GATE0_CRISIS_DANGER', false);
  return {
    text: opening?.text + '\n\n' + langHint?.text + '\n\n' + crisis?.text,
    options: crisis?.options,
    sessionEnded: false,
    stateUpdates: { currentGate: 'GATE0_CRISIS_DANGER' }
  };
}

function respond(key: string, session: SessionState, nextGate: Gate, ended: boolean, updates: Partial<SessionState> = {}): RoutingResult {
  const phrase = getPhrase(key, session.isSupporter);
  return { text: phrase?.text || '', options: phrase?.options, sessionEnded: ended, stateUpdates: { ...updates, currentGate: nextGate } };
}

function safeguardingExit(key: string, type: string, session: SessionState): RoutingResult {
  const phrase = getPhrase(key, session.isSupporter);
  return { text: phrase?.text || '', sessionEnded: true, stateUpdates: { safeguardingTriggered: true, safeguardingType: type, currentGate: 'SESSION_END' } };
}

function getDVExitKey(gender: string | null, hasChildren: boolean | null): string {
  const g = gender?.toLowerCase() || 'female';
  const c = hasChildren ? 'YES' : 'NO';
  if (g.includes('male') && !g.includes('female')) return `DV_MALE_CHILDREN_${c}`;
  if (g.includes('non-binary') || g.includes('other') || g.includes('lgbtq')) return `DV_LGBTQ_CHILDREN_${c}`;
  return `DV_FEMALE_CHILDREN_${c}`;
}

function terminal(session: SessionState, updates: Partial<SessionState>): RoutingResult {
  const la = session.localAuthority || 'your area';
  const need = session.supportNeed || 'support';
  let text = 'Based on what you have told me, here are services in ' + la + ' for ' + need + ':\n\n';
  text += 'Contact ' + la + ' Council Housing Options - they have a legal duty to help.\n\n';
  text += 'Shelter: 0808 800 4444 (free)\nhttps://england.shelter.org.uk\n\n';
  if (session.sleepingSituation === 'Rough sleeping') text += 'StreetLink: https://www.streetlink.org.uk\n\n';
  text += 'Is there anything else I can help with?\n\n1. Yes, I have another need\n2. No, that is everything';
  return { text, options: ['Yes', 'No'], sessionEnded: false, stateUpdates: { ...updates, currentGate: 'TERMINAL_ADDITIONAL_NEEDS' } };
}

export function processInput(session: SessionState, userInput: string): RoutingResult {
  const gate = session.currentGate;
  
  if (gate === 'INIT') return getFirstMessage(session);
  
  if (gate === 'GATE0_CRISIS_DANGER') {
    const phrase = getPhrase('GATE0_CRISIS_DANGER', false);
    const sel = parseUserInput(userInput, phrase?.options);
    if (!sel) return respond('GATE0_CRISIS_DANGER', session, 'GATE0_CRISIS_DANGER', false);
    if (sel === 1) return safeguardingExit('IMMEDIATE_PHYSICAL_DANGER_EXIT', 'IMMEDIATE_DANGER', session);
    if (sel === 2) return respond('DV_GENDER_ASK', session, 'DV_GENDER_ASK', false);
    if (sel === 3) return safeguardingExit('SA_EXIT', 'SA', session);
    if (sel === 4) return safeguardingExit('SELF_HARM_EXIT', 'SELF_HARM', session);
    if (sel === 5) return safeguardingExit('UNDER_16_EXIT', 'UNDER_16', session);
    if (sel === 6) return safeguardingExit('FIRE_FLOOD_EXIT', 'FIRE_FLOOD', session);
    return respond('GATE1_INTENT', session, 'GATE1_INTENT', false);
  }
  
  if (gate === 'DV_GENDER_ASK') {
    const phrase = getPhrase('DV_GENDER_ASK', session.isSupporter);
    const sel = parseUserInput(userInput, phrase?.options);
    if (!sel) return respond('DV_GENDER_ASK', session, 'DV_GENDER_ASK', false);
    const genders = ['Female', 'Male', 'Non-binary or other', 'Prefer not to say'];
    return respond('DV_CHILDREN_ASK', session, 'DV_CHILDREN_ASK', false, { gender: genders[sel-1] });
  }
  
  if (gate === 'DV_CHILDREN_ASK') {
    const phrase = getPhrase('DV_CHILDREN_ASK', session.isSupporter);
    const sel = parseUserInput(userInput, phrase?.options);
    if (!sel) return respond('DV_CHILDREN_ASK', session, 'DV_CHILDREN_ASK', false);
    const hasChildren = sel === 1;
    const exitKey = getDVExitKey(session.gender, hasChildren);
    return safeguardingExit(exitKey, 'DV', { ...session, hasChildren });
  }
  
  if (gate === 'GATE1_INTENT') {
    const phrase = getPhrase('GATE1_INTENT', false);
    const sel = parseUserInput(userInput, phrase?.options);
    if (!sel) return respond('GATE1_INTENT', session, 'GATE1_INTENT', false);
    return respond('GATE2_ROUTE_SELECTION', session, 'GATE2_ROUTE_SELECTION', false);
  }
  
  if (gate === 'GATE2_ROUTE_SELECTION') {
    const phrase = getPhrase('GATE2_ROUTE_SELECTION', false);
    const sel = parseUserInput(userInput, phrase?.options);
    if (!sel) return respond('GATE2_ROUTE_SELECTION', session, 'GATE2_ROUTE_SELECTION', false);
    return respond('B1_LOCAL_AUTHORITY', session, 'B1_LOCAL_AUTHORITY', false, { routeType: sel === 1 ? 'FULL' : 'QUICK' });
  }
  
  if (gate === 'B1_LOCAL_AUTHORITY') {
    const phrase = getPhrase('B1_LOCAL_AUTHORITY', false);
    const sel = parseUserInput(userInput, phrase?.options);
    if (!sel) return respond('B1_LOCAL_AUTHORITY', session, 'B1_LOCAL_AUTHORITY', false);
    const las = ['Wolverhampton', 'Coventry', 'Birmingham', 'Walsall', 'Solihull', 'Dudley', 'Sandwell', 'Other'];
    if (sel === 8) return respond('WMCA_ONLY_SCOPE_NOTICE', session, 'B1_LOCAL_AUTHORITY', false);
    return respond('B2_WHO_FOR', session, 'B2_WHO_FOR', false, { localAuthority: las[sel-1] });
  }
  
  if (gate === 'B2_WHO_FOR') {
    const phrase = getPhrase('B2_WHO_FOR', false);
    const sel = parseUserInput(userInput, phrase?.options);
    if (!sel) return respond('B2_WHO_FOR', session, 'B2_WHO_FOR', false);
    const isSupporter = sel === 2 || sel === 3;
    return respond('B3_AGE_CATEGORY', { ...session, isSupporter }, 'B3_AGE_CATEGORY', false, { userType: isSupporter ? 'SUPPORTER' : 'SELF', isSupporter });
  }
  
  if (gate === 'B3_AGE_CATEGORY') {
    const phrase = getPhrase('B3_AGE_CATEGORY', session.isSupporter);
    const sel = parseUserInput(userInput, phrase?.options);
    if (!sel) return respond('B3_AGE_CATEGORY', session, 'B3_AGE_CATEGORY', false);
    if (sel === 1) return safeguardingExit('UNDER_16_EXIT', 'UNDER_16', session);
    const ages = ['Under 16', '16-17', '18-24', '25 or over'];
    return respond('B5_MAIN_SUPPORT_NEED', session, 'B5_MAIN_SUPPORT_NEED', false, { ageCategory: ages[sel-1] });
  }
  
  if (gate === 'B5_MAIN_SUPPORT_NEED') {
    const phrase = getPhrase('B5_MAIN_SUPPORT_NEED', session.isSupporter);
    const sel = parseUserInput(userInput, phrase?.options);
    if (!sel) return respond('B5_MAIN_SUPPORT_NEED', session, 'B5_MAIN_SUPPORT_NEED', false);
    const needs = ['Emergency Housing', 'Food', 'Work', 'Health', 'Advice', 'Drop In', 'Financial', 'Items', 'Services', 'Comms', 'Training', 'Activities'];
    return respond('B6_HOMELESSNESS_STATUS', session, 'B6_HOMELESSNESS_STATUS', false, { supportNeed: needs[sel-1] });
  }
  
  if (gate === 'B6_HOMELESSNESS_STATUS') {
    const phrase = getPhrase('B6_HOMELESSNESS_STATUS', session.isSupporter);
    const sel = parseUserInput(userInput, phrase?.options);
    if (!sel) return respond('B6_HOMELESSNESS_STATUS', session, 'B6_HOMELESSNESS_STATUS', false);
    if (sel === 1) return respond('B7_HOMELESS_SLEEPING_SITUATION', session, 'B7_HOMELESS_SLEEPING_SITUATION', false, { homeless: true });
    return respond('B7_HOUSED_SITUATION', session, 'B7_HOUSED_SITUATION', false, { homeless: false });
  }
  
  if (gate === 'B7_HOUSED_SITUATION') {
    const phrase = getPhrase('B7_HOUSED_SITUATION', session.isSupporter);
    const sel = parseUserInput(userInput, phrase?.options);
    if (!sel) return respond('B7_HOUSED_SITUATION', session, 'B7_HOUSED_SITUATION', false);
    if (sel >= 2) return respond('B7_HOMELESS_SLEEPING_SITUATION', session, 'B7_HOMELESS_SLEEPING_SITUATION', false, { homeless: true });
    return respond('B7A_PREVENTION_GATE', session, 'B7A_PREVENTION_GATE', false);
  }
  
  if (gate === 'B7_HOMELESS_SLEEPING_SITUATION') {
    const phrase = getPhrase('B7_HOMELESS_SLEEPING_SITUATION', session.isSupporter);
    const sel = parseUserInput(userInput, phrase?.options);
    if (!sel) return respond('B7_HOMELESS_SLEEPING_SITUATION', session, 'B7_HOMELESS_SLEEPING_SITUATION', false);
    const sits = ['Rough sleeping', 'Sofa surfing', 'Hostel', 'B&B', 'Other'];
    return terminal(session, { sleepingSituation: sits[sel-1] });
  }
  
  if (gate === 'B7A_PREVENTION_GATE') {
    const phrase = getPhrase('B7A_PREVENTION_GATE', session.isSupporter);
    const sel = parseUserInput(userInput, phrase?.options);
    if (!sel) return respond('B7A_PREVENTION_GATE', session, 'B7A_PREVENTION_GATE', false);
    if (sel === 3) return respond('B6_HOMELESSNESS_STATUS', session, 'B6_HOMELESSNESS_STATUS', false);
    return terminal(session, { preventionNeed: sel === 1 ? 'YES' : 'NO' });
  }
  
  if (gate === 'TERMINAL_ADDITIONAL_NEEDS') {
    const sel = parseUserInput(userInput, ['Yes', 'No']);
    if (sel === 1) return respond('B5_MAIN_SUPPORT_NEED', session, 'B5_MAIN_SUPPORT_NEED', false);
    return respond('TERMINAL_GOODBYE', session, 'SESSION_END', true);
  }
  
  return respond('OUT_OF_SCOPE_GENERAL', session, 'SESSION_END', true);
}
