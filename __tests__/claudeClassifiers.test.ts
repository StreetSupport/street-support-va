/**
 * Street Support VA - Claude checks: model configuration and failure tests
 *
 * Backlog item 81 (VA #53). The VA called claude-sonnet-4-20250514, which
 * Anthropic retired on 15 June 2026. Requests to a retired model fail, and the
 * VA swallowed the failure, so typed answers quietly stopped being understood.
 *
 * These tests check three things:
 * 1. The model comes from configuration (CLAUDE_MODEL), default claude-sonnet-5-5.
 * 2. When the call fails, each check returns its safe value and logs one line
 *    that names the check and the model, never what the person typed.
 * 3. Through the real route, with every Claude call failing, the crisis gate
 *    and the under-16 intercept still work, and the route does not error.
 *
 * All inputs below are made up for the tests.
 *
 * An optional live check runs only when RUN_LIVE_CLAUDE_TESTS=1 and
 * ANTHROPIC_API_KEY are set. It is skipped in CI.
 */

import {
  DEFAULT_CLAUDE_MODEL,
  getClaudeModel,
  setClaudeClientForTests,
  checkScope,
  detectAdviceQuestion,
  interpretWithClaude,
  type ClaudeClient,
} from '../lib/claudeClassifiers';
import { POST } from '../app/api/chat/route';
import { createSession } from '../lib/stateMachine';
import type { GateType, SessionState } from '../lib/types';

type CreateArgs = { model: string; max_tokens: number; thinking?: { type: string } };

function replying(text: string) {
  const create = jest.fn((_args: CreateArgs) => Promise.resolve({ content: [{ type: 'text', text }] }));
  setClaudeClientForTests({ messages: { create } } as unknown as ClaudeClient);
  return create;
}

// The shape the SDK throws for a retired or unknown model.
function retiredModelError() {
  return Object.assign(new Error('model: claude-sonnet-4-20250514'), {
    name: 'NotFoundError',
    status: 404,
    error: { type: 'error', error: { type: 'not_found_error' } },
  });
}

function failing(error: Error = retiredModelError()) {
  const create = jest.fn(() => Promise.reject(error));
  setClaudeClientForTests({ messages: { create } } as unknown as ClaudeClient);
  return create;
}

let errorSpy: jest.SpyInstance;
let logSpy: jest.SpyInstance;
const savedModel = process.env.CLAUDE_MODEL;

beforeEach(() => {
  delete process.env.CLAUDE_MODEL;
  errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  setClaudeClientForTests(null);
  errorSpy.mockRestore();
  logSpy.mockRestore();
  if (savedModel === undefined) delete process.env.CLAUDE_MODEL;
  else process.env.CLAUDE_MODEL = savedModel;
});

// =============================================================================
// 1. Model configuration
// =============================================================================

describe('Claude model configuration', () => {
  test('defaults to claude-sonnet-5-5', () => {
    expect(DEFAULT_CLAUDE_MODEL).toBe('claude-sonnet-5-5');
    expect(getClaudeModel()).toBe('claude-sonnet-5-5');
  });

  test('uses CLAUDE_MODEL when set', () => {
    process.env.CLAUDE_MODEL = 'claude-haiku-5-5';
    expect(getClaudeModel()).toBe('claude-haiku-5-5');
  });

  test('ignores an empty CLAUDE_MODEL', () => {
    process.env.CLAUDE_MODEL = '   ';
    expect(getClaudeModel()).toBe('claude-sonnet-5-5');
  });

  test('all three checks send the configured model', async () => {
    process.env.CLAUDE_MODEL = 'claude-haiku-5-5';
    const create = replying('none');
    await checkScope('my landlord has asked me to leave next month');
    await detectAdviceQuestion('how long does it all take?');
    await interpretWithClaude('the second one please', ['Yes', 'No']);
    expect(create).toHaveBeenCalledTimes(3);
    for (const call of create.mock.calls) expect(call[0].model).toBe('claude-haiku-5-5');
  });

  test('all three checks turn thinking off and leave room for the answer', async () => {
    const create = replying('none');
    await checkScope('my landlord has asked me to leave next month');
    await detectAdviceQuestion('how long does it all take?');
    await interpretWithClaude('the second one please', ['Yes', 'No']);
    expect(create).toHaveBeenCalledTimes(3);
    for (const call of create.mock.calls) {
      expect(call[0].thinking).toEqual({ type: 'between_tools' });
      expect(call[0].max_tokens).toBeGreaterThanOrEqual(64);
    }
  });

  test('the answer is read from the text block even when a thinking block comes first', async () => {
    const create = jest.fn(() => Promise.resolve({ content: [{ type: 'thinking', thinking: '' }, { type: 'text', text: '2' }] }));
    setClaudeClientForTests({ messages: { create } } as unknown as ClaudeClient);
    await expect(interpretWithClaude('the second one please', ['Yes', 'No'])).resolves.toBe(2);
  });
});

// =============================================================================
// 2. When the call fails, each check returns its safe value
// =============================================================================

describe('When the Claude call fails', () => {
  const typed = 'made-up-test-input-7f3a my landlord changed the locks';

  test('scope check returns "unclear", so the flow carries on', async () => {
    failing();
    await expect(checkScope(typed)).resolves.toBe('unclear');
  });

  test('advice check finds no topic', async () => {
    failing();
    await expect(detectAdviceQuestion(`what happens now? ${typed}`)).resolves.toBeNull();
  });

  test('interpretation returns null, so normal unclear handling applies', async () => {
    failing();
    await expect(interpretWithClaude(typed, ['Yes', 'No'])).resolves.toBeNull();
  });

  test('logs one line naming the check, model and status, never the input', async () => {
    failing();
    await checkScope(typed);
    expect(errorSpy).toHaveBeenCalledTimes(1);
    const line = errorSpy.mock.calls[0].join(' ');
    expect(line).toContain('scope_check');
    expect(line).toContain('claude-sonnet-5-5');
    expect(line).toContain('404');
    expect(line).toContain('not_found_error');
    expect(line).not.toContain('made-up-test-input-7f3a');
  });

  test('a network error with no status is also handled', async () => {
    failing(new TypeError('fetch failed'));
    await expect(interpretWithClaude(typed, ['Yes', 'No'])).resolves.toBeNull();
    expect(errorSpy.mock.calls[0].join(' ')).toContain('status none');
  });

  test('an empty reply is treated as no answer', async () => {
    const create = jest.fn(() => Promise.resolve({ content: [] }));
    setClaudeClientForTests({ messages: { create } } as unknown as ClaudeClient);
    await expect(checkScope(typed)).resolves.toBe('unclear');
    await expect(interpretWithClaude(typed, ['Yes', 'No'])).resolves.toBeNull();
  });
});

// =============================================================================
// 3. Through the route, with every Claude call failing
// =============================================================================

function encode(s: SessionState): string {
  return Buffer.from(JSON.stringify(s)).toString('base64');
}

function decode(s: string): SessionState {
  return JSON.parse(Buffer.from(s, 'base64').toString('utf8')) as SessionState;
}

function sessionAt(gate: GateType, extra: Partial<SessionState> = {}): SessionState {
  return { ...createSession('test'), currentGate: gate, ...extra };
}

async function send(message: string, session?: SessionState) {
  const req = new Request('http://localhost/api/chat', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ message, s: session ? encode(session) : '' }),
  });
  const res = await POST(req as unknown as Parameters<typeof POST>[0]);
  const body = (await res.json()) as { s: string; e?: boolean };
  return { status: res.status, body };
}

describe('Route with Claude unavailable', () => {
  test('the first message is still the crisis gate', async () => {
    const create = failing();
    const { status, body } = await send('');
    expect(status).toBe(200);
    expect(decode(body.s).currentGate).toBe('GATE0_CRISIS_DANGER');
    expect(create).not.toHaveBeenCalled();
  });

  test('a typed under-16 age at an early gate still triggers the intercept, before any Claude call', async () => {
    const create = failing();
    const { status, body } = await send("I'm 14 and I need somewhere to stay", sessionAt('GATE1_INTENT'));
    expect(status).toBe(200);
    const s = decode(body.s);
    expect(s.safeguardingTriggered).toBe(true);
    expect(s.currentGate).toBe('CRISIS_UNDER16_LOCATION');
    expect(create).not.toHaveBeenCalled();
  });

  test('free text at an early gate does not error: the person stays on the same question', async () => {
    failing();
    const before = sessionAt('GATE1_INTENT');
    const { status, body } = await send('I am not sure what I need really', before);
    expect(status).toBe(200);
    expect(body.e).toBeFalsy();
    const s = decode(body.s);
    expect(s.currentGate).toBe('GATE1_INTENT');
    expect(s.unclearCount).toBe(before.unclearCount + 1);
  });

  test('a numbered answer still works without Claude', async () => {
    const create = failing();
    const { status, body } = await send('1', sessionAt('GATE1_INTENT'));
    expect(status).toBe(200);
    expect(decode(body.s).currentGate).not.toBe('GATE1_INTENT');
    expect(create).not.toHaveBeenCalled();
  });
});

// =============================================================================
// 4. The crisis question: typed text never goes to Claude or advice matching
// =============================================================================

describe('Crisis question', () => {
  test('a typed disclosure stays on the crisis question with its options, and Claude is never called', async () => {
    const create = replying('4'); // would pick "Domestic abuse" if asked
    const before = sessionAt('GATE0_CRISIS_DANGER');
    const { status, body } = await send("my partner hit me and I've got nowhere to sleep tonight", before);
    expect(status).toBe(200);
    const s = decode(body.s);
    expect(s.currentGate).toBe('GATE0_CRISIS_DANGER');
    expect((body as { o?: string[] }).o).toEqual(expect.arrayContaining(['Domestic abuse', 'Immediate physical danger']));
    expect((body as { m?: string }).m ?? '').not.toMatch(/ADVICE|sleep tonight/i);
    expect(create).not.toHaveBeenCalled();
  });

  test('a number still works at the crisis question', async () => {
    const create = replying('1');
    const { status, body } = await send('7', sessionAt('GATE0_CRISIS_DANGER'));
    expect(status).toBe(200);
    expect(decode(body.s).currentGate).not.toBe('GATE0_CRISIS_DANGER');
    expect(create).not.toHaveBeenCalled();
  });
});

// =============================================================================
// 5. Optional live check against the configured model (skipped in CI)
// =============================================================================

const live = process.env.RUN_LIVE_CLAUDE_TESTS === '1' && !!process.env.ANTHROPIC_API_KEY;

(live ? describe : describe.skip)('Live: configured model answers the three checks', () => {
  jest.setTimeout(60000);

  beforeEach(() => {
    errorSpy.mockRestore();
    errorSpy = jest.spyOn(console, 'error');
  });

  test('scope check recognises housing and non-housing', async () => {
    await expect(checkScope('my landlord has asked me to leave by the end of the month')).resolves.toBe('in_scope');
    await expect(checkScope('which planet is furthest from the sun')).resolves.toBe('out_of_scope');
    expect(errorSpy).not.toHaveBeenCalled();
  });

  test('interpretation picks the matching option', async () => {
    await expect(interpretWithClaude('the first one', ['Find support for myself', 'Find support for someone else'])).resolves.toBe(1);
    expect(errorSpy).not.toHaveBeenCalled();
  });

  test('advice check matches a topic', async () => {
    await expect(detectAdviceQuestion('if my mate lets me kip on his settee, does that count?')).resolves.toEqual(expect.stringMatching(/^ADVICE_/));
    expect(errorSpy).not.toHaveBeenCalled();
  });
});
