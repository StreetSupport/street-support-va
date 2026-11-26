// Street Support VA v7 API Route
// Handles session state and Claude interpretation fallback

import { NextRequest, NextResponse } from 'next/server';
import { checkScope, detectAdviceQuestion, interpretWithClaude } from '@/lib/claudeClassifiers';
import type { SessionState } from '@/lib/types';
import {
  createSession,
  processInput,
  getFirstMessage,
  parseUserInput,
  parseHousingSituationInput,
  parseGenderInput,
  GENDER_GATES,
  heldTransAnswer,
  processLocationInput,
  interceptUnder16Age,
  secondScreenPhraseKey
} from '@/lib/stateMachine';
import { getPhrase } from '@/lib/phrasebank';
import { generalSafetyExit, isSafetyGate, parseSafetyChoice } from '@/lib/handlers/safety';
import { isLiveReadEnabled, runWithServicePool, type ServicePool } from '@/lib/data/servicePool';
import { loadServicesNear } from '@/lib/data/platformServices';
import { poolForTurn } from '@/lib/data/liveReadGates';

// Which turns read live, and why, is in lib/data/liveReadGates.ts. `input` is
// what the state machine is given for this turn.
async function servicePoolFor(session: SessionState, input: string): Promise<ServicePool | null> {
  if (!isLiveReadEnabled()) return null;
  return poolForTurn(session, input, loadServicesNear);
}

// Encode/decode state as base64 for reliable transport
function encodeState(s: SessionState): string {
  return Buffer.from(JSON.stringify(s)).toString('base64');
}

function decodeState(str: string): SessionState | null {
  try {
    return JSON.parse(Buffer.from(str, 'base64').toString('utf8'));
  } catch { 
    return null; 
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message = body.message || '';
    const encodedState = body.s || '';
    const locationData = body.locationData; // Location result from widget
    
    // Decode or create session
    let session: SessionState = decodeState(encodedState) || createSession(crypto.randomUUID());
    
    console.log(`[VA] Gate: ${session.currentGate}`);
    
    // INIT -> return first message (crisis gate)
    if (session.currentGate === 'INIT') {
      const result = getFirstMessage(session);
      session = { ...session, ...result.stateUpdates };
      
      return NextResponse.json({
        s: encodeState(session),
        m: result.text,
        o: result.options,
        e: false
      });
    }
    
    // Handle location result from widget
    if (message === '__LOCATION_RESULT__' && locationData) {
      // Log the local authority only. Coordinates are never logged: the
      // Analytics Contract limits geographic analysis to local authority level.
      console.log('[VA] Location result:', JSON.stringify({
        success: !!locationData.success,
        localAuthority: locationData.localAuthority ?? null,
        inWMCA: locationData.isWMCA ?? null,
      }));
      
      const result = processLocationInput(session, locationData);
      session = { ...session, ...result.stateUpdates };
      
      return NextResponse.json({
        s: encodeState(session),
        m: result.text,
        o: result.options,
        e: result.sessionEnded,
        responseType: result.responseType
      });
    }
    
    // Mid-conversation under-16 safeguarding intercept.
    // Runs at every gate, not just early gates. Must fire BEFORE any Claude
    // classifier (checkScope, detectAdviceQuestion) to ensure safeguarding
    // is never gated behind an async API call.
    const under16Exit = interceptUnder16Age(session, message);
    if (under16Exit) {
      session = { ...session, ...under16Exit.stateUpdates };
      return NextResponse.json({
        s: encodeState(session),
        m: under16Exit.text,
        o: under16Exit.options,
        e: under16Exit.sessionEnded,
      });
    }

    // Get current phrase for option parsing
    const currentPhrase = getPhrase(
      session.currentGate === 'B5_SECOND_SCREEN' ? secondScreenPhraseKey(session.v4Option) : session.currentGate,
      session.isSupporter,
    );

    const isCrisisGate = session.currentGate === 'GATE0_CRISIS_DANGER';

    // Check for out-of-scope requests at early gates. Never at the crisis
    // question: typed text there is not sent to Claude or matched to advice.
    const earlyGates = ['GATE1_INTENT', 'B4_ADVICE_TOPIC_SELECTION', 'ADVICE_BRIDGE'];
    if (earlyGates.includes(session.currentGate) && message.length > 5 && !/^\d+$/.test(message.trim())) {
      const scope = await checkScope(message);
      if (scope === 'out_of_scope') {
        const outOfScope = getPhrase('OUT_OF_SCOPE_GENERAL', session.isSupporter);
        return NextResponse.json({
          s: encodeState(session),
          m: outOfScope?.text || 'I\'m here to help with housing and homelessness support. Is there something related to that I can help you with?',
          o: currentPhrase?.options,
          e: false
        });
      }

      // Check for advice questions (tangent handling)
      const advicePhraseKey = await detectAdviceQuestion(message);
      if (advicePhraseKey) {
        console.log(`[VA] Advice tangent detected: ${advicePhraseKey}`);
        const adviceContent = getPhrase(advicePhraseKey, session.isSupporter);
        const adviceBridge = getPhrase('ADVICE_BRIDGE', session.isSupporter);

        if (adviceContent) {
          // Set gate to ADVICE_BRIDGE so next response is handled correctly
          session.currentGate = 'ADVICE_BRIDGE';

          // Return advice content with bridge options
          return NextResponse.json({
            s: encodeState(session),
            m: `${adviceContent.text}\n\n---\n\n${adviceBridge?.text || 'Is there anything else I can help with?'}`,
            o: adviceBridge?.options || ['Connect me to support services', 'I have another question', 'That\'s all I needed, thanks'],
            e: false
          });
        }
      }
    }

    // The name question takes free text. It is passed to the state machine as
    // typed and never sent to Claude for interpretation. The under-16 check
    // above has already run on it.
    const isNameGate = session.currentGate === 'PREFERRED_NAME_ASK';
    // The noticing step reads several numbers or exact words itself, and never
    // asks the AI: it rests only on what the person states (design note 3.5).
    // A trans answer typed at B4 or B5 gender is passed as typed and never sent
    // to the AI, so it is never read as Male or Female (stateMachine.ts).
    const isRawGate = isNameGate || session.currentGate === 'B5_NOTICING' || session.currentGate === 'B5_NOT_SURE' || session.currentGate === 'B5_HOUSING_OFFER'
      || heldTransAnswer(session.currentGate, message);

    // The Safety from harm route bypasses the AI (Safeguarding Contract 3.3).
    // Only a chosen option counts: no keyword matching, no Claude, and never the
    // general escalation, which leads to the matcher.
    const safetyGate = isSafetyGate(session.currentGate);
    // The first question and its second screens: a number or the option's own
    // words only. The loose first-word match would read "a" on "A hot meal",
    // or "staying" on the Safety option, into unrelated text.
    // The care questions likewise: the loose match would read a typed "no" as
    // "No, but I have a social worker".
    const menuGate = session.currentGate === 'B5_MAIN_SUPPORT_NEED' || session.currentGate === 'B5_SECOND_SCREEN'
      || session.currentGate === 'C3Q11_EVER_IN_CARE_16_17' || session.currentGate === 'C3Q11_EVER_IN_CARE'
      || session.currentGate === 'C3Q11A_CARE_COUNCIL';

    // Try to parse user input
    let parsed = isRawGate
      ? 0
      : safetyGate
        ? parseSafetyChoice(message, currentPhrase?.options)
        : menuGate
          ? parseSafetyChoice(message, currentPhrase?.options)
          : session.currentGate === 'B6_HOMELESSNESS_STATUS'
            ? parseHousingSituationInput(message, currentPhrase?.options)
            : GENDER_GATES.has(session.currentGate)
              ? parseGenderInput(message, currentPhrase?.options, session.currentGate)
              : parseUserInput(message, currentPhrase?.options);
    
    // If parsing failed and we have options, try Claude interpretation, except
    // on the Safety route and at the crisis question, where only buttons,
    // numbers and close matches count
    if (parsed === null && currentPhrase?.options && !safetyGate && !isCrisisGate) {
      parsed = await interpretWithClaude(message, currentPhrase.options);
    }
    
    // If still unclear, handle escalation
    if (parsed === null) {
      session.unclearCount++;

      // On the Safety route: ask once more; after that, show every line on the
      // route, 999 first, so no one is left without help.
      if (safetyGate) {
        if (session.unclearCount >= 2) {
          const help = generalSafetyExit(session);
          session = { ...session, ...help.stateUpdates, unclearCount: 0 };
          console.log('[VA] SESSION END:', JSON.stringify({
            id: session.sessionId,
            la: session.localAuthority,
            userType: session.userType,
            age: session.ageCategory,
            need: session.supportNeed,
            homeless: session.homeless,
            safeguarding: session.safeguardingType,
            escalation: session.escalationLevel,
            duration: session.duration,
            routeType: session.routeType
          }));
          return NextResponse.json({
            s: encodeState(session),
            m: help.text,
            o: help.options,
            e: help.sessionEnded,
          });
        }
        return NextResponse.json({
          s: encodeState(session),
          m: `I didn't quite catch that. Please choose one of the options.\n\n${currentPhrase?.text || ''}`,
          o: currentPhrase?.options,
          e: false
        });
      }
      
      // Level 1 escalation at 2 unclear
      if (session.unclearCount === 2) {
        const level1 = getPhrase('ESCALATION_LEVEL_1_BRIDGE', session.isSupporter);
        return NextResponse.json({
          s: encodeState(session),
          m: level1?.text || 'I\'m having trouble understanding. Could you try again?',
          o: level1?.options,
          e: false
        });
      }
      
      // Level 2 escalation at 3+ unclear
      if (session.unclearCount >= 3) {
        const level2 = getPhrase('ESCALATION_LEVEL_2_INTERVENTION', session.isSupporter);
        session.escalationLevel = 2;
        session.currentGate = 'ESCALATION_LEVEL_2';
        
        return NextResponse.json({
          s: encodeState(session),
          m: level2?.text || 'This doesn\'t seem to be working. Let me help another way.',
          o: level2?.options,
          e: false
        });
      }
      
      // Simple retry
      return NextResponse.json({
        s: encodeState(session),
        m: `I didn't quite catch that. Please reply with a number from the options.\n\n${currentPhrase?.text || ''}`,
        o: currentPhrase?.options,
        e: false
      });
    }
    
    // Reset unclear count on successful parse. The noticing step reads its own
    // answer and keeps its own count, so a second unclear answer reaches results.
    if (session.currentGate !== 'B5_NOTICING' && session.currentGate !== 'B5_NOT_SURE' && session.currentGate !== 'B5_HOUSING_OFFER') session.unclearCount = 0;
    
    // Process the input through state machine
    const input = isRawGate ? message : String(parsed);
    const pool = await servicePoolFor(session, input);
    const result = runWithServicePool(pool, () => processInput(session, input));
    session = { ...session, ...result.stateUpdates };
    
    console.log(`[VA] -> Next gate: ${session.currentGate}, Ended: ${result.sessionEnded}`);
    
    // Log session end for analytics
    if (result.sessionEnded) {
      console.log('[VA] SESSION END:', JSON.stringify({
        id: session.sessionId,
        la: session.localAuthority,
        userType: session.userType,
        age: session.ageCategory,
        need: session.supportNeed,
        homeless: session.homeless,
        safeguarding: session.safeguardingType,
        escalation: session.escalationLevel,
        duration: session.duration,
        routeType: session.routeType
      }));
    }
    
    return NextResponse.json({
      s: encodeState(session),
      m: result.text,
      o: result.options,
      e: result.sessionEnded,
      responseType: result.responseType,
      ms: result.multiSelect,
    });
    
  } catch (error) {
    console.error('[VA] Error:', error);
    
    // Graceful fallback
    return NextResponse.json({ 
      m: `Something went wrong. Please contact Shelter directly:

Shelter Emergency Helpline
0808 800 4444 (free, 8am-8pm weekdays, 9am-5pm weekends)
https://england.shelter.org.uk`, 
      e: true 
    }, { status: 500 });
  }
}
