import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { SessionState, createSession, processInput, getFirstMessage, parseUserInput } from '@/lib/stateMachine';
import { getPhrase } from '@/lib/phrasebank';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function encodeState(s: SessionState): string {
  return Buffer.from(JSON.stringify(s)).toString('base64');
}

function decodeState(str: string): SessionState | null {
  try {
    return JSON.parse(Buffer.from(str, 'base64').toString('utf8'));
  } catch { return null; }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message = body.message || '';
    const encodedState = body.s || '';
    
    let session: SessionState = decodeState(encodedState) || createSession(crypto.randomUUID());
    
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
    
    const currentPhrase = getPhrase(session.currentGate, session.isSupporter);
    let parsed = parseUserInput(message, currentPhrase?.options);
    
    if (parsed === null && currentPhrase?.options) {
      parsed = await interpretWithClaude(message, currentPhrase.options);
    }
    
    if (parsed === null) {
      session.unclearCount++;
      return NextResponse.json({
        s: encodeState(session),
        m: "Please reply with a number.\n\n" + (currentPhrase?.text || ''),
        o: currentPhrase?.options,
        e: false
      });
    }
    
    const result = processInput(session, String(parsed));
    session = { ...session, ...result.stateUpdates };
    
    return NextResponse.json({
      s: encodeState(session),
      m: result.text,
      o: result.options,
      e: result.sessionEnded
    });
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ m: 'Error. Call Shelter: 0808 800 4444', e: true }, { status: 500 });
  }
}

async function interpretWithClaude(input: string, options: string[]): Promise<number | null> {
  try {
    const list = options.map((o, i) => `${i + 1}. ${o}`).join('\n');
    const res = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 10,
      system: 'Reply ONLY with number or "unclear".',
      messages: [{ role: 'user', content: `"${input}"\n\n${list}` }]
    });
    const txt = res.content[0].type === 'text' ? res.content[0].text.trim() : '';
    const n = parseInt(txt, 10);
    return (!isNaN(n) && n >= 1 && n <= options.length) ? n : null;
  } catch { return null; }
}
