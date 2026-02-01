// Street Support VA v7 API Route
// Handles session state and Claude interpretation fallback

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { 
  SessionState, 
  createSession, 
  processInput, 
  getFirstMessage, 
  parseUserInput 
} from '@/lib/stateMachine';
import { getPhrase } from '@/lib/phrasebank';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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

// Use Claude to interpret ambiguous user input
async function interpretWithClaude(input: string, options: string[]): Promise<number | null> {
  try {
    const list = options.map((o, i) => `${i + 1}. ${o}`).join('\n');
    const res = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 10,
      system: 'You are helping interpret user input for a support service chatbot. Reply with ONLY the number (1, 2, 3, etc.) that best matches what the user meant, or "unclear" if you cannot determine their intent. Nothing else.',
      messages: [{ 
        role: 'user', 
        content: `The user said: "${input}"\n\nWhich of these options did they mean?\n${list}\n\nReply with just the number or "unclear":` 
      }]
    });
    
    const txt = res.content[0].type === 'text' ? res.content[0].text.trim() : '';
    if (txt.toLowerCase() === 'unclear') return null;
    
    const n = parseInt(txt, 10);
    return (!isNaN(n) && n >= 1 && n <= options.length) ? n : null;
  } catch (error) {
    console.error('Claude interpretation error:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message = body.message || '';
    const encodedState = body.s || '';
    
    // Decode or create session
    let session: SessionState = decodeState(encodedState) || createSession(crypto.randomUUID());
    
    console.log(`[VA] Gate: ${session.currentGate}, Input: "${message.substring(0, 50)}..."`);
    
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
    
    // Get current phrase for option parsing
    const currentPhrase = getPhrase(session.currentGate, session.isSupporter);
    
    // Try to parse user input
    let parsed = parseUserInput(message, currentPhrase?.options);
    
    // If parsing failed and we have options, try Claude interpretation
    if (parsed === null && currentPhrase?.options) {
      parsed = await interpretWithClaude(message, currentPhrase.options);
    }
    
    // If still unclear, handle escalation
    if (parsed === null) {
      session.unclearCount++;
      
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
    
    // Reset unclear count on successful parse
    session.unclearCount = 0;
    
    // Process the input through state machine
    const result = processInput(session, String(parsed));
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
      e: result.sessionEnded
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
