import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { SessionState, createSession, processInput, getFirstMessage, parseUserInput } from '@/lib/stateMachine';
import { getPhrase } from '@/lib/phrasebank';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { sessionState, message } = await request.json();
    
    let session: SessionState;
    if (sessionState && sessionState.sessionId) {
      session = sessionState as SessionState;
    } else {
      session = createSession(crypto.randomUUID());
    }
    
    if (session.currentGate === 'INIT') {
      const result = getFirstMessage(session);
      session = { ...session, ...result.stateUpdates };
      return NextResponse.json({
        sessionState: session,
        message: result.text,
        quickReplies: result.options?.map((opt, i) => ({ label: opt.substring(0, 40), value: String(i + 1) })),
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
      if (session.unclearCount >= 3) {
        const esc = getPhrase('ESCALATION_LEVEL_2_INTERVENTION', false);
        return NextResponse.json({
          sessionState: session,
          message: esc?.text,
          quickReplies: [{ label: 'Continue', value: '1' }, { label: 'Show services', value: '2' }, { label: 'Call Shelter', value: '3' }],
          sessionEnded: false
        });
      }
      return NextResponse.json({
        sessionState: session,
        message: "I didn't quite catch that. Please reply with a number.\n\n" + (currentPhrase?.text || ''),
        quickReplies: currentPhrase?.options?.map((opt, i) => ({ label: opt.substring(0, 40), value: String(i + 1) })),
        sessionEnded: false
      });
    }
    
    const result = processInput(session, String(parsed));
    session = { ...session, ...result.stateUpdates };
    
    if (result.sessionEnded) {
      console.log('SESSION END:', JSON.stringify({ id: session.sessionId, la: session.localAuthority, need: session.supportNeed, safeguarding: session.safeguardingType }));
    }
    
    return NextResponse.json({
      sessionState: session,
      message: result.text,
      quickReplies: result.options?.map((opt, i) => ({ label: opt.substring(0, 40), value: String(i + 1) })),
      sessionEnded: result.sessionEnded
    });
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ message: 'Something went wrong. Call Shelter: 0808 800 4444', sessionEnded: true }, { status: 500 });
  }
}

async function interpretWithClaude(input: string, options: string[]): Promise<number | null> {
  try {
    const list = options.map((o, i) => `${i + 1}. ${o}`).join('\n');
    const res = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 10,
      system: 'Reply with ONLY the number (1, 2, 3...) or "unclear".',
      messages: [{ role: 'user', content: `User: "${input}"\n\nOptions:\n${list}\n\nNumber?` }]
    });
    const txt = res.content[0].type === 'text' ? res.content[0].text.trim() : '';
    if (txt === 'unclear') return null;
    const n = parseInt(txt, 10);
    return (!isNaN(n) && n >= 1 && n <= options.length) ? n : null;
  } catch { return null; }
}
