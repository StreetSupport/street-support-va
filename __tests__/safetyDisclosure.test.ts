/**
 * Safety disclosure check: every line of Appendix A in both directions
 * (Safety Disclosure Check Design Note v1.0, section 9). A release does not go
 * ahead unless all of these pass.
 */
import { detectDisclosure, readDisclosureAnswer, DisclosureFamily } from '../lib/safetyDisclosure';

const TRIGGERS: Array<[string, DisclosureFamily]> = [
  // A
  ["I don't feel safe", 'A'], ['I dont feel safe', 'A'], ['I do not feel safe', 'A'], ['I feel unsafe', 'A'],
  ["I'm not safe", 'A'], ['Im not safe', 'A'], ['I am not safe', 'A'], ["I'm unsafe", 'A'],
  ["I'm scared to go home", 'A'], ["I'm afraid to go home", 'A'], ["I'm frightened to go home", 'A'],
  ["I'm really scared to go home", 'A'],
  ["I'm scared of my partner", 'A'], ["I'm afraid of my dad", 'A'], ["I'm frightened of my ex", 'A'],
  ["I'm in danger", 'A'], ['my life is in danger', 'A'], ['I fear for my life', 'A'],
  // B
  ['my partner hits me', 'B'], ['he hits me', 'B'], ['he hit me', 'B'], ['my dad beats me', 'B'], ['she beat me', 'B'],
  ['my boyfriend punches me', 'B'], ['he kicks me', 'B'], ['my husband slaps me', 'B'], ['he hurts me', 'B'],
  ['she hurt me', 'B'], ['he strangled me', 'B'], ['my ex choked me', 'B'],
  ['my brother pushed me', 'B'],
  ['my dad kicked me', 'B'], ['he kicked me in the stomach', 'B'], ['he threatened me with a knife', 'B'],
  ['she threatens me', 'B'], ['my mum threatened me', 'B'], ['he threatened to hurt me', 'B'],
  ['he threatens to hurt my kids', 'B'], ['she threatened to hurt my children', 'B'],
  ['he threatened to hurt my pet', 'B'], ['they threatened to hurt my dog', 'B'],
  ["he won't let me leave", 'B'], ["he won't let me go out", 'B'], ["she won't let me see my friends", 'B'],
  ["my husband doesn't let me see my family", 'B'], ["they don't let me have money", 'B'],
  ["he won't allow me have my phone", 'B'], ['he wont let me leave', 'B'],
  ['he controls my money', 'B'], ['my partner checks my phone', 'B'], ['she tracks my phone', 'B'],
  ['he reads my messages', 'B'],
  ["I'm being abused", 'B'], ["I'm being hit", 'B'], ["I'm being beaten", 'B'], ["I'm being controlled", 'B'],
  ["I'm being stalked", 'B'], ["I'm in an abusive relationship", 'B'], ["I'm experiencing domestic abuse", 'B'],
  ["I'm experiencing domestic violence", 'B'], ["I'm experiencing coercive control", 'B'],
  ["I'm experiencing economic abuse", 'B'],
  ['is it normal that my partner hits me?', 'B'],
  // C
  ["they're making me marry", 'C'], ['my family are forcing me to marry', 'C'], ['they forced me to marry', 'C'],
  ['they forsd me to marry', 'C'], ["I'm being forced to marry", 'C'], ['I was forced into marriage', 'C'],
  ["they want me to marry someone I don't want", 'C'],
  ['they are threatening to take me abroad to marry', 'C'], ['my dad threatened to take me abroad to get married', 'C'],
  ["they're going to take me abroad to marry", 'C'],
  ["I'm experiencing honour-based abuse", 'C'], ["I'm experiencing honour based violence", 'C'],
  ["they will kill me if I don't marry", 'C'],
  // D
  ['they want to cut me', 'D'], ['my mum wants to cut me', 'D'], ["they're going to cut me", 'D'],
  ['they plan to cut me', 'D'], ['they are planning to cut me', 'D'], ['they are taking me abroad to be cut', 'D'],
  ['I was cut as a girl', 'D'], ['I was cut as a child', 'D'], ["I've had FGM", 'D'], ['I have had FGM', 'D'],
  ['I had FGM', 'D'], ['I had khitan', 'D'], ['I had fanadu di mindjer', 'D'],
  ['they want to do sunna to me', 'D'], ['they are taking me abroad for gudiniin', 'D'],
  // E
  ['I was raped', 'E'], ["I've been raped", 'E'], ['he raped me', 'E'], ['a man raped me', 'E'],
  ['I was sexually assaulted', 'E'], ["I've been sexually abused", 'E'], ['someone sexually assaulted me', 'E'],
  ['my uncle sexually abused me', 'E'],
  ['I was violated', 'E'], ['he forced me to have sex', 'E'], ['they made me have sex', 'E'],
  ['he touched me when I said no', 'E'], ['he touched me without my consent', 'E'],
  // F
  ['they took my passport', 'F'], ['my boss has my documents', 'F'], ['they have my ID', 'F'],
  ['my employer keeps my papers', 'F'], ['he kept my phone', 'F'],
  ['they made me work for nothing', 'F'], ['they forced me to work for no money', 'F'],
  ['he makes me work for free', 'F'], ['they made me work for them', 'F'],
  ["I'm made to work for nothing", 'F'], ["I'm made to work for no money", 'F'], ["I'm made to work for free", 'F'],
  ['they take my wages', 'F'], ['my boss keeps my pay', 'F'],
  ["they won't let me leave the house", 'F'], ["he won't let me leave where I work", 'F'],
  ["my landlord won't let me leave where I live", 'F'],
  ["I'm locked in", 'F'], ['they keep me in the house', 'F'],
  ['I have to work to pay off a debt to them', 'F'], ["I'm working to pay off a debt to them", 'F'],
  ['they make me work to pay what I owe', 'F'],
  // G
  ["he said he'll kill me", 'G'], ['she says she will kill me', 'G'], ['they threatened to kill me', 'G'],
  ['the people I owe are going to kill me', 'G'], ['my boss will kill me', 'G'], ['he is going to kill me', 'G'],
  ['he is gonna kill me', 'G'],
];

const SILENT: string[] = [
  // A
  'is it safe', 'is this site safe', 'is it safe to eat', 'I feel safe now', "I'm scared of the interview",
  'scared of spiders', 'in danger of eviction', "I'm in danger of losing my job",
  // B
  'my back hurts me', 'my feet hurt', 'my landlord hit me with a sanction', 'they hit me with a bill',
  'the council hit me with arrears', 'my landlord hit me with a fine', 'he hit me with a charge',
  'my mum keeps pushing me to move out',
  // Managing Director, 26 November 2026
  'my mum kicked me out', 'they kicked me out', 'my landlord kicks me out', 'my landlord threatened to evict me',
  'my landlord has threatened to kick me out',
  'my landlord threatened me with eviction', 'he threatened me with court', 'they threatened me with bailiffs',
  'my landlord threatened me with a section 21', 'they threatened me with a sanction',
  "he won't let me pay later", 'they take money out of my benefits',
  'domestic abuse services near me', 'abuse of power',
  "he doesn't hit me", 'he never hits me', 'he no longer hits me', 'I hit my partner',
  // C
  "I'm getting married", 'getting married next year', 'marriage advice', 'going abroad on holiday',
  'what is honour-based abuse',
  // D
  'cut my hair', 'they cut my benefits', "they're going to cut me off", 'FGM services', 'what is FGM', 'sunna',
  // E
  'Rape Crisis', 'where is Rape Crisis', 'rape', 'sexual health clinic',
  // F
  'I lost my passport', 'my passport expired', 'the Home Office has my passport', 'the council kept my ID',
  'the jobcentre has my papers', "I'm forced to work two jobs", 'the jobcentre made me do a placement',
  'I work too much', "I can't leave the house", "I'm not allowed to leave after 10pm", 'I owe money',
  "I'm in debt", 'they never took my passport',
  // Rules 7 and 8
  'what does coercive control mean', 'where can I find help if my partner hits me',
  'what if someone hits me', 'if someone hits me what do I do',
];

describe('Appendix A: every trigger example triggers its family', () => {
  test.each(TRIGGERS)('%s -> %s', (text, family) => {
    expect(detectDisclosure(text)).toContain(family);
  });
});

describe('Appendix A: every example that does not trigger stays silent', () => {
  test.each(SILENT)('%s', text => {
    expect(detectDisclosure(text)).toEqual([]);
  });
});

describe('matching rules', () => {
  test('rule 1: whole words only', () => {
    expect(detectDisclosure('I ate grapes')).toEqual([]);
  });
  test('rule 3: a full stop ends the sentence', () => {
    expect(detectDisclosure('He came round. It hurts me to say it')).toEqual([]);
    expect(detectDisclosure('He came round. My back hurts me')).toEqual([]);
  });
  test('rule 4: more than four words between parts does not match', () => {
    expect(detectDisclosure('he said that on the bus it hit me')).toEqual([]);
  });
  test('rule 6: negations in the line\'s own wording still trigger', () => {
    expect(detectDisclosure("I don't feel safe")).toEqual(['A']);
    expect(detectDisclosure("I'm not safe")).toEqual(['A']);
    expect(detectDisclosure("he won't let me leave")).toEqual(['B']);
    expect(detectDisclosure("she doesn't let me see my friends")).toEqual(['B']);
    expect(detectDisclosure('he touched me without my consent')).toEqual(['E']);
  });
  test('one message can match several families', () => {
    expect(detectDisclosure("my partner hits me and said he'll kill me")).toEqual(['B', 'G']);
  });
  test('statements about someone else do not trigger', () => {
    expect(detectDisclosure('he hits her')).toEqual([]);
  });
});

describe('reading the answer to the clarifying question (section 3)', () => {
  const options = ['Yes, show me help with staying safe', 'No, carry on'];
  test.each(['1', 'Yes, show me help with staying safe', 'yes', 'Y', 'yeah', 'yep', 'yes please', 'ok', 'okay', 'please', 'Yes.'])(
    'yes: %s', a => expect(readDisclosureAnswer(a, options)).toBe('yes'));
  test.each(['2', 'No, carry on', 'no', 'N', 'nope', 'no thanks', 'no thank you', 'carry on'])(
    'no: %s', a => expect(readDisclosureAnswer(a, options)).toBe('no'));
  test.each(['maybe', 'I dunno', '3', 'yes and no', ''])('unclear: %s', a => expect(readDisclosureAnswer(a, options)).toBe('unclear'));
  test('an explicit statement counts as yes', () => {
    expect(readDisclosureAnswer('he hits me', options)).toBe('yes');
  });
});
