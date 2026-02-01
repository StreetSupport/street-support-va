import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { SessionState, createSession, processInput, getFirstMessage, parseUserInput } from '@/lib/stateMachine';
import { getPhrase } from '@/lib/phrasebank';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message = body.message || '';
    
    let session: SessionState;
    
    if (body.state && body.state.currentGate) {
      session = {
        sessionId: body.state.sessionId || crypto.randomUUID(),
        currentGate: body.state.currentGate,
        routeType: body.state.routeType || null,
        localAuthority: body.state.localAuthority || null,
        jurisdiction: body.state.jurisdiction || 'ENGLAND',
        userType: body.state.userType || null,
        ageCategory: body.state.ageCategory || null,
        gender: body.state.gender || null,
        supportNeed: body.state.supportNeed || null,
        homeless: body.state.homeless ?? null,
        sleepingSituation: body.state.sleepingSituation || null,
        housedSituation: body.state.housedSituation || null,
        preventionNeed: body.state.preventionNeed || null,
        hasChildren: body.state.hasChildren ?? null,
        isSupporter: body.state.isSupporter || false,
        unclearCount: body.state.unclearCount || 0,
        safeguardingTriggered: body.state.safeguardingTriggered || false,
        safeguardingType: body.state.safeguardingType || null,
        timestampStart: body.state.timestampStart || new Date().toISOString(),
      };
    } else {
      session = createSession(crypto.randomUUID());
    }
    
    console.log('GATE:', session.currentGate, 'INPUT:', message);
    
    if (session.currentGate === 'INIT') {
      const result = getFirstMessage(session);
      const newState = { ...session, ...result.stateUpdates };
      console.log('NEW GATE:', newState.currentGate);
      return NextResponse.json({
        state: newState,
        message: result.text,
        options: result.options,
        sessionEnded: false
      });
    }
    
    const currentPhrase = getPhrase(session.currentGate, session.isSupporter);
    let parsed = parseUserInput(message, currentPhrase?.options);
    
    if (parsed === null && currentPhrase?.options) {
      parsed = await interpretWithClaude(message, currentPhrase.options);
    }
    
    if (parsed === null) {
      session.unclearCount++;
      return NextResponse.json({
        state: session,
        message: "Please reply with a number from the options.\n\n" + (currentPhrase?.text || ''),
        options: currentPhrase?.options,
        sessionEnded: false
      });
    }
    
    const result = processInput(session, String(parsed));
    const newState = { ...session, ...result.stateUpdates };
    
    console.log('PROCESSED:', session.currentGate, '->', newState.currentGate);
    
    return NextResponse.json({
      state: newState,
      message: result.text,
      options: result.options,
      sessionEnded: result.sessionEnded
    });
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ message: 'Error. Call Shelter: 0808 800 4444', sessionEnded: true }, { status: 500 });
  }
}

async function interpretWithClaude(input: string, options: string[]): Promise<number | null> {
  try {
    const list = options.map((o, i) => `${i + 1}. ${o}`).join('\n');
    const res = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 10,
      system: 'Reply ONLY with the number or "unclear".',
      messages: [{ role: 'user', content: `"${input}"\n\n${list}\n\nNumber?` }]
    });
    const txt = res.content[0].type === 'text' ? res.content[0].text.trim() : '';
    const n = parseInt(txt, 10);
    return (!isNaN(n) && n >= 1 && n <= options.length) ? n : null;
  } catch { return null; }
}
