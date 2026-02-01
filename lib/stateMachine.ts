import { getPhrase, PhraseEntry } from './phrasebank';

export type Gate = 
  | 'INIT' | 'GATE0_CRISIS_DANGER' | 'GATE1_INTENT' | 'GATE2_ROUTE_SELECTION'
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
    preventionNeed: null, isSupporter: false, unclearCount: 0,
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
    text: `${opening?.text}\n\n${langHint?.text}\n\n${crisis?.text}`,
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

function terminal(session: SessionState, updates: Partial<SessionState>): RoutingResult {
  const la = session.localAuthority || 'your area';
  const need = session.supportNeed || 'support';
  let text = `Based on what you've told me, here are services in ${la} for ${need}:\n\n`;
  text += `Contact ${la} Council Housing Options - they have a legal duty to help.\n\n`;
  text += `Shelter: 0808 800 4444 (free)\nhttps://england.shelter.org.uk\n\n`;
  if (session.sleepingSituation === 'Rough sleeping') text += `StreetLink: https://www.streetlink.org.uk\n\n`;
  text += `Is there anything else I can help with?\n\n1. Yes, I have another need\n2. No, that's everything`;
  return { text, options: ['Yes', 'No'], sessionEnded: false, stateUpdates: { ...updates, currentGate: 'TERMINAL_ADDITIONAL_NEEDS' } };
}

export function processInput(session: SessionState, userInput: string): RoutingResult {
  const gate = session.currentGate;
  
  if (gate === 'INIT') return getFirstMessage(session);
  
  if (gate === 'GATE0_CRISIS_DANGER') {
    const phrase = getPhrase('GATE0_CRISIS_DANGER', false);
    const sel = parseUserInput(userInput, phrase?.options);
    if (!sel) return respond('GATE0_CRISIS_DANGER', session, 'GATE0_CRISIS_DANGER', false);
    if (sel === 1) return safeguardingExit('IMMEDIATE_PHYSICAL_DANGE
