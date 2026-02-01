import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const sessions: Map<string, any> = new Map();

export async function POST(request: NextRequest) {
  try {
    const { sessionId, message } = await request.json();
    
    let session = sessionId ? sessions.get(sessionId) : null;
    if (!session) {
      session = {
        id: crypto.randomUUID(),
        history: [],
        currentGate: 'INIT',
      };
      sessions.set(session.id, session);
    }

    session.history.push({ role: 'user', content: message });

    const systemPrompt = `You are Street Support Network's Virtual Assistant. Help people find homelessness and housing support services.

CRITICAL: Your FIRST response to ANY new user must be the crisis gate:

"Hello. I'm here to help you find support in your area.

If you'd prefer to use a different language, just reply in that language and I'll do my best to continue.

Before continuing, I need to check something important.

Are you in crisis or danger right now?

Please reply with the number that fits best:
1. Immediate physical danger
2. Domestic abuse
3. Sexual violence
4. Thoughts of harming myself
5. Under 16 and need protection
6. Lost home due to fire, flood, or emergency
7. None of these apply"

After user responds:
- Options 1-6: Provide appropriate safeguarding resources and end
- Option 7: Continue to ask what they need help with

Be warm, supportive, and never provide legal advice. Format phone numbers with spaces like 0808 800 4444.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: session.history,
    });

    const assistantMessage = response.content[0].type === 'text' 
      ? response.content[0].text 
      : 'I apologize, something went wrong.';

    session.history.push({ role: 'assistant', content: assistantMessage });

    return NextResponse.json({
      sessionId: session.id,
      message: assistantMessage,
    });

  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process message. Call Shelter on 0808 800 4444 for help.' },
      { status: 500 }
    );
  }
}
