// Street Support VA v7 Phrasebank - COMPLETE VERSION
// All phrases from CHAR_VA_Phrasebank_v7.md
// Generated 2026-02-01

export interface PhraseEntry {
  text: string;
  options?: string[];
}

export const phrasebank: Record<string, PhraseEntry> = {

  // ============================================================
  // OPENING & LANGUAGE
  // ============================================================

  OPENING_LINE: {
    text: `Hello. I'm here to help you find support in your area.`
  },

  LANG_HINT_LINE: {
    text: `If you'd prefer to use a different language, just reply in that language and I'll do my best to continue.`
  },

  // ============================================================
  // GATE 0: CRISIS GATE
  // ============================================================

  GATE0_CRISIS_DANGER: {
    text: `Before continuing, I need to check something important.

Are you in crisis or danger right now?

Please reply with the number that fits best:
1. Immediate physical danger
2. Domestic abuse
3. Sexual violence
4. Thoughts of harming myself
5. Under 16 and need protection
6. Lost home due to fire, flood, or emergency
7. None of these apply`,
    options: ["Immediate physical danger", "Domestic abuse", "Sexual violence", "Thoughts of harming myself", "Under 16 and need protection", "Lost home due to fire, flood, or emergency", "None of these apply"]
  },

  GATE0_CRISIS_DANGER__SUPPORTER: {
    text: `Before continuing, please check something important with them.

Which of these fits their situation best?

1. Immediate physical danger
2. Domestic abuse
3. Sexual violence
4. Thoughts of harming themselves
5. Under 16 and need protection
6. Lost home due to fire, flood, or emergency
7. None of these apply`,
    options: ["Immediate physical danger", "Domestic abuse", "Sexual violence", "Thoughts of harming themselves", "Under 16 and need protection", "Lost home due to fire, flood, or emergency", "None of these apply"]
  },

  // ============================================================
  // GATE 1: INTENT
  // ============================================================

  GATE1_INTENT: {
    text: `What are you looking for today?

1. Advice (information or explanation)
2. Help connecting to support (we'll guide you through)
3. Details for a specific organisation`,
    options: ["Advice (information or explanation)", "Help connecting to support (we'll guide you through)", "Details for a specific organisation"]
  },

  // ============================================================
  // GATE 2: ROUTE SELECTION
  // ============================================================

  GATE2_ROUTE_SELECTION: {
    text: `I'll ask a few questions to understand what support might help most. It usually takes about five minutes.

The full guided route asks about things like health conditions, immigration status, criminal convictions, and other circumstances that might affect which services can help you. Some services are specifically designed for people in particular situations, so these questions help us find the best match.

If none of those apply to you, the quicker route will assume the answers are 'no' or 'none' and get you to relevant services faster.

This is entirely up to you - which would you prefer?

1. Full Guided Route (tailored support)
2. Quicker Route (general support)`,
    options: ["Full Guided Route (tailored support)", "Quicker Route (general support)"]
  },

  // ============================================================
  // ADVICE MODE
  // ============================================================

  B4_ADVICE_TOPIC_SELECTION: {
    text: `What would you like information about?

1. Your rights and eligibility for housing help
2. Preventing homelessness (keeping your home)
3. How council housing processes work
4. What support services are available
5. Eviction, notices, and emergency situations
6. Other housing or homelessness question`,
    options: ["Your rights and eligibility for housing help", "Preventing homelessness (keeping your home)", "How council housing processes work", "What support services are available", "Eviction, notices, and emergency situations", "Other housing or homelessness question"]
  },

  B4_ADVICE_TOPIC_SELECTION__SUPPORTER: {
    text: `What would they like information about?

1. Their rights and eligibility for housing help
2. Preventing homelessness (keeping their home)
3. How council housing processes work
4. What support services are available
5. Eviction, notices, and emergency situations
6. Other housing or homelessness question`,
    options: ["Their rights and eligibility for housing help", "Preventing homelessness (keeping their home)", "How council housing processes work", "What support services are available", "Eviction, notices, and emergency situations", "Other housing or homelessness question"]
  },

  ADVICE_BOUNDARY: {
    text: `I can explain how things usually work, but for advice about your specific situation it's best to speak to a specialist service. I can help you find one.`
  },

  ADVICE_BOUNDARY__SUPPORTER: {
    text: `I can explain how things usually work, but for advice about their specific situation it's best to speak to a specialist service. I can help you find one.`
  },

  ADVICE_BRIDGE: {
    text: `Is there anything else I can help with?

1. Connect me to support services
2. I have another question
3. That's all I needed, thanks`,
    options: ["Connect me to support services", "I have another question", "That's all I needed, thanks"]
  },

  ADVICE_BRIDGE__SUPPORTER: {
    text: `Is there anything else I can help with?

1. Connect them to support services
2. We have another question
3. That's all we needed, thanks`,
    options: ["Connect them to support services", "We have another question", "That's all we needed, thanks"]
  },

  DEBT_HELP_NATIONAL: {
    text: `Financial struggles are tough.
We'll do everything we can to connect you with local support.
You might also find these resources helpful:

Money and debt advice | CAP UK - https://capuk.org/money-and-debt-advice

Debt Advice from StepChange - https://www.stepchange.org/

Support with Benefits and Grants | Turn2us - https://www.turn2us.org.uk/`
  },

  // ============================================================
  // SECTION B: CORE PROFILE (B1-B7A)
  // ============================================================

  B1_LOCAL_AUTHORITY: {
    text: `Which local authority are you in (or want to get support from)?

1. Wolverhampton
2. Coventry
3. Birmingham
4. Walsall
5. Solihull
6. Dudley
7. Sandwell
8. Other / not sure`,
    options: ["Wolverhampton", "Coventry", "Birmingham", "Walsall", "Solihull", "Dudley", "Sandwell", "Other / not sure"]
  },

  B1_LOCAL_AUTHORITY__SUPPORTER: {
    text: `Which local authority are they in (or want to get support from)?

1. Wolverhampton
2. Coventry
3. Birmingham
4. Walsall
5. Solihull
6. Dudley
7. Sandwell
8. Other / not sure`,
    options: ["Wolverhampton", "Coventry", "Birmingham", "Walsall", "Solihull", "Dudley", "Sandwell", "Other / not sure"]
  },

  B2_WHO_FOR: {
    text: `Are you looking for support for yourself, or for someone else?

1. Myself
2. Someone I'm supporting
3. I'm a professional or organisation
4. Not sure / just trying to find the right place`,
    options: ["Myself", "Someone I'm supporting", "I'm a professional or organisation", "Not sure / just trying to find the right place"]
  },

  B3_AGE_CATEGORY: {
    text: `Which age group are you in?

1. Under 16
2. 16-17
3. 18-24
4. 25 or over`,
    options: ["Under 16", "16-17", "18-24", "25 or over"]
  },

  B3_AGE_CATEGORY__SUPPORTER: {
    text: `Which age group are they in?

1. Under 16
2. 16-17
3. 18-24
4. 25 or over`,
    options: ["Under 16", "16-17", "18-24", "25 or over"]
  },

  B4_GENDER: {
    text: `I need to ask about gender because some services are specifically for particular genders. I know these options don't fit everyone perfectly - please choose whichever feels closest, or 'Prefer not to say' if you'd rather skip this.

1. Male
2. Female
3. Non-binary or other
4. Prefer not to say`,
    options: ["Male", "Female", "Non-binary or other", "Prefer not to say"]
  },

  B4_GENDER__SUPPORTER: {
    text: `I need to ask about gender because some services are specifically for particular genders. These options might not fit everyone perfectly.

1. Male
2. Female
3. Non-binary or other
4. Prefer not to say`,
    options: ["Male", "Female", "Non-binary or other", "Prefer not to say"]
  },

  B5_MAIN_SUPPORT_NEED: {
    text: `What kind of support are you looking for?

1. Emergency Housing or Other Accommodation
2. Food
3. Work
4. Health Services
5. Advice Services
6. Drop In
7. Financial Help
8. Personal Items
9. Personal Services
10. Communications
11. Training
12. Activities`,
    options: ["Emergency Housing or Other Accommodation", "Food", "Work", "Health Services", "Advice Services", "Drop In", "Financial Help", "Personal Items", "Personal Services", "Communications", "Training", "Activities"]
  },

  B5_MAIN_SUPPORT_NEED__SUPPORTER: {
    text: `What kind of support are they looking for?

1. Emergency Housing or Other Accommodation
2. Food
3. Work
4. Health Services
5. Advice Services
6. Drop In
7. Financial Help
8. Personal Items
9. Personal Services
10. Communications
11. Training
12. Activities`,
    options: ["Emergency Housing or Other Accommodation", "Food", "Work", "Health Services", "Advice Services", "Drop In", "Financial Help", "Personal Items", "Personal Services", "Communications", "Training", "Activities"]
  },

  B6_HOMELESSNESS_STATUS: {
    text: `Are you currently experiencing homelessness?

That includes if you don't have your own place and you're staying in temporary accommodation, hospital, prison, or somewhere that isn't your permanent home.

1. Yes
2. No`,
    options: ["Yes", "No"]
  },

  B6_HOMELESSNESS_STATUS__SUPPORTER: {
    text: `Are they currently experiencing homelessness?

That includes if they don't have their own place and they're staying in temporary accommodation, hospital, prison, or somewhere that isn't their permanent home.

1. Yes
2. No`,
    options: ["Yes", "No"]
  },

  B7_HOUSED_SITUATION: {
    text: `Thank you for reaching out. Whatever's brought you here, I'll do my best to help.

Where are you living at the moment?

1. At home (your own tenancy or ownership)
2. Staying temporarily with friends or family
3. Temporary accommodation arranged by the council
4. Other temporary situation`,
    options: ["At home (your own tenancy or ownership)", "Staying temporarily with friends or family", "Temporary accommodation arranged by the council", "Other temporary situation"]
  },

  B7_HOUSED_SITUATION__SUPPORTER: {
    text: `Thank you for reaching out on their behalf. Whatever's brought you here, I'll do my best to help.

Where are they living at the moment?

1. At home (their own tenancy or ownership)
2. Staying temporarily with friends or family
3. Temporary accommodation arranged by the council
4. Other temporary situation`,
    options: ["At home (their own tenancy or ownership)", "Staying temporarily with friends or family", "Temporary accommodation arranged by the council", "Other temporary situation"]
  },

  B7_HOMELESS_SLEEPING_SITUATION: {
    text: `I'm sorry you're going through this. Let me ask a few more questions so I can find the right support for you.

Where are you sleeping at the moment? This helps us understand what kind of support might work for you.

1. Rough sleeping (on the streets, in doorways, parks, or similar)
2. Emergency accommodation (hostel, shelter, night shelter)
3. Sofa surfing (staying temporarily with friends or family)
4. Temporary accommodation arranged by the council
5. Other temporary situation`,
    options: ["Rough sleeping (on the streets, in doorways, parks, or similar)", "Emergency accommodation (hostel, shelter, night shelter)", "Sofa surfing (staying temporarily with friends or family)", "Temporary accommodation arranged by the council", "Other temporary situation"]
  },

  B7_HOMELESS_SLEEPING_SITUATION__SUPPORTER: {
    text: `I'm sorry they're going through this. Let me ask a few more questions so I can find the right support for them.

Where are they sleeping at the moment? This helps us understand what kind of support might work for them.

1. Rough sleeping (on the streets, in doorways, parks, or similar)
2. Emergency accommodation (hostel, shelter, night shelter)
3. Sofa surfing (staying temporarily with friends or family)
4. Temporary accommodation arranged by the council
5. Other temporary situation`,
    options: ["Rough sleeping (on the streets, in doorways, parks, or similar)", "Emergency accommodation (hostel, shelter, night shelter)", "Sofa surfing (staying temporarily with friends or family)", "Temporary accommodation arranged by the council", "Other temporary situation"]
  },

  B7A_PREVENTION_GATE: {
    text: `You mentioned you're at home right now. Are you worried about losing your accommodation, or are you looking for information about housing options?

1. Yes, I'm at risk of losing my home
2. No, I'm just looking for general information
3. Actually, I need to change my previous answer`,
    options: ["Yes, I'm at risk of losing my home", "No, I'm just looking for general information", "Actually, I need to change my previous answer"]
  },

  B7A_PREVENTION_GATE__SUPPORTER: {
    text: `You mentioned they're at home right now. Are they worried about losing their accommodation, or are you looking for information about housing options?

1. Yes, they're at risk of losing their home
2. No, just looking for general information
3. Actually, I need to change the previous answer`,
    options: ["Yes, they're at risk of losing their home", "No, just looking for general information", "Actually, I need to change the previous answer"]
  },

  // ============================================================
  // PREVENTION PATHWAY (B7B-B7E)
  // ============================================================

  B7B_PREVENTION_REASON: {
    text: `What's making you worried about losing your home?

1. Rent arrears or struggling to pay rent
2. Eviction notice or landlord wants me to leave
3. Mortgage arrears
4. Notice to leave from family or friends
5. Other financial difficulties
6. Prefer not to say`,
    options: ["Rent arrears or struggling to pay rent", "Eviction notice or landlord wants me to leave", "Mortgage arrears", "Notice to leave from family or friends", "Other financial difficulties", "Prefer not to say"]
  },

  B7B_PREVENTION_REASON__SUPPORTER: {
    text: `What's making them worried about losing their home?

1. Rent arrears or struggling to pay rent
2. Eviction notice or landlord wants them to leave
3. Mortgage arrears
4. Notice to leave from family or friends
5. Other financial difficulties
6. Prefer not to say`,
    options: ["Rent arrears or struggling to pay rent", "Eviction notice or landlord wants them to leave", "Mortgage arrears", "Notice to leave from family or friends", "Other financial difficulties", "Prefer not to say"]
  },

  B7C_PREVENTION_URGENCY: {
    text: `How urgent does this feel right now?

1. It's happening now or very soon (days or weeks)
2. It's a worry but not immediate (months away)
3. Not sure / just want to understand my options`,
    options: ["It's happening now or very soon (days or weeks)", "It's a worry but not immediate (months away)", "Not sure / just want to understand my options"]
  },

  B7C_PREVENTION_URGENCY__SUPPORTER: {
    text: `How urgent does this feel for them right now?

1. It's happening now or very soon (days or weeks)
2. It's a worry but not immediate (months away)
3. Not sure / they just want to understand their options`,
    options: ["It's happening now or very soon (days or weeks)", "It's a worry but not immediate (months away)", "Not sure / they just want to understand their options"]
  },

  B7D_1_PREVENTION_CHILDREN_DEPENDENTS: {
    text: `This helps me understand what support might be available. Are there any children or other people who depend on you living in your home?

1. Yes
2. No
3. Prefer not to say`,
    options: ["Yes", "No", "Prefer not to say"]
  },

  B7D_1_PREVENTION_CHILDREN_DEPENDENTS__SUPPORTER: {
    text: `This helps me understand what support might be available. Are there any children or other people who depend on them living in their home?

1. Yes
2. No
3. Prefer not to say`,
    options: ["Yes", "No", "Prefer not to say"]
  },

  B7D_2_PREVENTION_EMPLOYMENT_INCOME: {
    text: `Can you tell me a bit about your work situation? This helps me find the right kind of support.

1. Employed (full-time or part-time)
2. Unemployed
3. On benefits (Universal Credit, ESA, PIP, etc.)
4. Self-employed or gig work
5. Not working (student, carer, other)
6. Prefer not to say`,
    options: ["Employed (full-time or part-time)", "Unemployed", "On benefits (Universal Credit, ESA, PIP, etc.)", "Self-employed or gig work", "Not working (student, carer, other)", "Prefer not to say"]
  },

  B7D_2_PREVENTION_EMPLOYMENT_INCOME__SUPPORTER: {
    text: `Can you tell me a bit about their work situation? This helps me find the right kind of support.

1. Employed (full-time or part-time)
2. Unemployed
3. On benefits (Universal Credit, ESA, PIP, etc.)
4. Self-employed or gig work
5. Not working (student, carer, other)
6. Prefer not to say`,
    options: ["Employed (full-time or part-time)", "Unemployed", "On benefits (Universal Credit, ESA, PIP, etc.)", "Self-employed or gig work", "Not working (student, carer, other)", "Prefer not to say"]
  },

  B7D_3_PREVENTION_PRIOR_SUPPORT: {
    text: `Have you already reached out to anyone about this? It helps to know so I don't suggest things you've already tried.

1. Yes, I've spoken to someone (landlord, council, advice service, etc.)
2. No, I haven't reached out yet
3. I'm not sure who to contact`,
    options: ["Yes, I've spoken to someone (landlord, council, advice service, etc.)", "No, I haven't reached out yet", "I'm not sure who to contact"]
  },

  B7D_3_PREVENTION_PRIOR_SUPPORT__SUPPORTER: {
    text: `Have they already reached out to anyone about this? It helps to know so I don't suggest things they've already tried.

1. Yes, they've spoken to someone (landlord, council, advice service, etc.)
2. No, they haven't reached out yet
3. They're not sure who to contact`,
    options: ["Yes, they've spoken to someone (landlord, council, advice service, etc.)", "No, they haven't reached out yet", "They're not sure who to contact"]
  },

  B7D_4_PREVENTION_SAFEGUARDING_SIGNALS: {
    text: `Sometimes housing worries come alongside other difficult things. Is there anything else going on that might be important for me to know about? There's no pressure to share if you'd rather not.

1. Yes, there's something else I'd like to mention
2. No, it's just the housing situation
3. Prefer not to say`,
    options: ["Yes, there's something else I'd like to mention", "No, it's just the housing situation", "Prefer not to say"]
  },

  B7D_4_PREVENTION_SAFEGUARDING_SIGNALS__SUPPORTER: {
    text: `Sometimes housing worries come alongside other difficult things. Is there anything else going on that might be important for me to know about? There's no pressure to share if you'd rather not.

1. Yes, there's something else they'd like to mention
2. No, it's just the housing situation
3. Prefer not to say`,
    options: ["Yes, there's something else they'd like to mention", "No, it's just the housing situation", "Prefer not to say"]
  },

  B7D_4A_PREVENTION_SAFEGUARDING_FOLLOW_UP: {
    text: `Can you tell me a bit more about what's concerning you? Is it related to:

1. Domestic abuse or violence
2. Health or mental health crisis
3. Substance use concerns
4. Child safety concerns
5. Something else
6. Prefer not to say`,
    options: ["Domestic abuse or violence", "Health or mental health crisis", "Substance use concerns", "Child safety concerns", "Something else", "Prefer not to say"]
  },

  B7D_4A_PREVENTION_SAFEGUARDING_FOLLOW_UP__SUPPORTER: {
    text: `Can you tell me a bit more about what's concerning them? Is it related to:

1. Domestic abuse or violence
2. Health or mental health crisis
3. Substance use concerns
4. Child safety concerns
5. Something else
6. Prefer not to say`,
    options: ["Domestic abuse or violence", "Health or mental health crisis", "Substance use concerns", "Child safety concerns", "Something else", "Prefer not to say"]
  },

  // ============================================================
  // HOMELESS CONTINUATION (B8-B12)
  // ============================================================

  B8_DURATION: {
    text: `How long has this been going on?

1. Less than a week
2. 1-4 weeks
3. 1-6 months
4. 6-12 months
5. Over a year`,
    options: ["Less than a week", "1-4 weeks", "1-6 months", "6-12 months", "Over a year"]
  },

  B8_DURATION__SUPPORTER: {
    text: `How long has this been going on for them?

1. Less than a week
2. 1-4 weeks
3. 1-6 months
4. 6-12 months
5. Over a year`,
    options: ["Less than a week", "1-4 weeks", "1-6 months", "6-12 months", "Over a year"]
  },

  B9_REASON: {
    text: `This next question is personal, and you can choose 'prefer not to say' if you'd rather skip it. Understanding what led to your situation helps me find the most relevant support.

What do you think is the main reason?

1. Relationship breakdown
2. Domestic abuse
3. Lost job or financial difficulties
4. Asked to leave by family or friends
5. End of tenancy or eviction
6. Leaving prison or hospital
7. Mental health difficulties
8. Substance use
9. Other / prefer not to say`,
    options: ["Relationship breakdown", "Domestic abuse", "Lost job or financial difficulties", "Asked to leave by family or friends", "End of tenancy or eviction", "Leaving prison or hospital", "Mental health difficulties", "Substance use", "Other / prefer not to say"]
  },

  B9_REASON__SUPPORTER: {
    text: `This next question is personal, and you can choose 'prefer not to say' if they'd rather skip it. Understanding what led to their situation helps me find the most relevant support.

What do they think is the main reason?

1. Relationship breakdown
2. Domestic abuse
3. Lost job or financial difficulties
4. Asked to leave by family or friends
5. End of tenancy or eviction
6. Leaving prison or hospital
7. Mental health difficulties
8. Substance use
9. Other / prefer not to say`,
    options: ["Relationship breakdown", "Domestic abuse", "Lost job or financial difficulties", "Asked to leave by family or friends", "End of tenancy or eviction", "Leaving prison or hospital", "Mental health difficulties", "Substance use", "Other / prefer not to say"]
  },

  B9C_MENTAL_HEALTH_ACKNOWLEDGMENT: {
    text: `Thank you for sharing that. Mental health can affect so many parts of life, and it takes courage to talk about it. I'll keep this in mind as I help you find support.`
  },

  B9C_MENTAL_HEALTH_ACKNOWLEDGMENT__SUPPORTER: {
    text: `Thank you for sharing that. Mental health can affect so many parts of life. I'll keep this in mind as I help find support for them.`
  },

  B10_INCOME: {
    text: `Do you currently have any income?

1. Yes, through employment
2. Yes, through benefits
3. Yes, through family or friends
4. No income at all
5. Prefer not to say`,
    options: ["Yes, through employment", "Yes, through benefits", "Yes, through family or friends", "No income at all", "Prefer not to say"]
  },

  B10_INCOME__SUPPORTER: {
    text: `Do they currently have any income?

1. Yes, through employment
2. Yes, through benefits
3. Yes, through family or friends
4. No income at all
5. Prefer not to say`,
    options: ["Yes, through employment", "Yes, through benefits", "Yes, through family or friends", "No income at all", "Prefer not to say"]
  },

  B11_PRIOR_USE: {
    text: `Have you used Street Support Network before?

It's fine if you're not sure. We just want to understand how best to help.

1. Yes
2. No
3. Not sure`,
    options: ["Yes", "No", "Not sure"]
  },

  B11_PRIOR_USE__SUPPORTER: {
    text: `Have they used Street Support Network before?

It's fine if they're not sure. We just want to understand how best to help.

1. Yes
2. No
3. Not sure`,
    options: ["Yes", "No", "Not sure"]
  },

  B12_ALREADY_SUPPORTED: {
    text: `Are you currently getting support from any organisation? This helps me avoid recommending the same service you're already using.

1. Yes
2. No`,
    options: ["Yes", "No"]
  },

  B12_ALREADY_SUPPORTED__SUPPORTER: {
    text: `Are they currently getting support from any organisation? This helps me avoid recommending the same service they're already using.

1. Yes
2. No`,
    options: ["Yes", "No"]
  },

  B12A_WHICH_ORG: {
    text: `Which organisation is supporting you? Just type the name if you know it, or describe them if you're not sure.`
  },

  B12A_WHICH_ORG__SUPPORTER: {
    text: `Which organisation is supporting them? Just type the name if you know it, or describe them if you're not sure.`
  },

  // ============================================================
  // SECTION C: DETAILED PROFILING
  // ============================================================

  C2_CONSENT_GATE: {
    text: `Thanks for sharing that. To help you find the right support, I need to ask a few more questions.

Some of these might be about sensitive topics - like your health, ethnicity, or sexual orientation. I only ask because certain services are designed for people in particular circumstances, and this helps me guide you to the right places.

- We don't collect or store anything that can personally identify you
- Your answers are only used to match you with the right organisation
- You can skip any question or choose "Prefer not to say"

Privacy info: https://streetsupport.net/about/privacy-and-data/

Do you give your consent for me to ask these additional questions?

1. Yes, I consent
2. No, I do not consent`,
    options: ["Yes, I consent", "No, I do not consent"]
  },

  C2_CONSENT_GATE__SUPPORTER: {
    text: `Thanks for sharing that. To help them find the right support, I need to ask a few more questions.

Some of these might be about sensitive topics - like their health, ethnicity, or sexual orientation. I only ask because certain services are designed for people in particular circumstances, and this helps me guide them to the right places.

Please check with them before you answer.

- We don't collect or store anything that can personally identify them
- Their answers are only used to match them with the right organisation
- They can skip any question or choose "Prefer not to say"

Privacy info: https://streetsupport.net/about/privacy-and-data/

Do they give their consent for me to ask these additional questions?

1. Yes, they consent
2. No, they do not consent`,
    options: ["Yes, they consent", "No, they do not consent"]
  },

  C2A_CONSENT_ACKNOWLEDGED: {
    text: `Thank you. I'll ask about a few different topics now - health, background, and circumstances. Remember you can skip any question or say 'prefer not to say'.`
  },

  C2A_CONSENT_ACKNOWLEDGED__SUPPORTER: {
    text: `Thank you. I'll ask about a few different topics now - health, background, and circumstances. Remember they can skip any question or say 'prefer not to say'.`
  },

  C3Q1_IMMIGRATION_STATUS: {
    text: `What is your immigration status?

1. British National
2. EU Settlement Scheme (settled or pre-settled status)
3. Refugee status
4. Leave to remain
5. Asylum seeker
6. No immigration status
7. Prefer not to say / Not sure`,
    options: ["British National", "EU Settlement Scheme (settled or pre-settled status)", "Refugee status", "Leave to remain", "Asylum seeker", "No immigration status", "Prefer not to say / Not sure"]
  },

  C3Q1_IMMIGRATION_STATUS__SUPPORTER: {
    text: `What is their immigration status?

1. British National
2. EU Settlement Scheme (settled or pre-settled status)
3. Refugee status
4. Leave to remain
5. Asylum seeker
6. No immigration status
7. Prefer not to say / Not sure`,
    options: ["British National", "EU Settlement Scheme (settled or pre-settled status)", "Refugee status", "Leave to remain", "Asylum seeker", "No immigration status", "Prefer not to say / Not sure"]
  },

  C3Q1A_EUSS_FOLLOWUP: {
    text: `Do you have settled status, pre-settled status, or are you unsure?

1. Settled
2. Pre-settled
3. Unsure`,
    options: ["Settled", "Pre-settled", "Unsure"]
  },

  C3Q1A_EUSS_FOLLOWUP__SUPPORTER: {
    text: `Do they have settled status, pre-settled status, or are they unsure?

1. Settled
2. Pre-settled
3. Unsure`,
    options: ["Settled", "Pre-settled", "Unsure"]
  },

  C3Q1B_PUBLIC_FUNDS_FOLLOWUP: {
    text: `Do you have access to public funds?

1. Yes
2. No
3. Not sure`,
    options: ["Yes", "No", "Not sure"]
  },

  C3Q1B_PUBLIC_FUNDS_FOLLOWUP__SUPPORTER: {
    text: `Do they have access to public funds?

1. Yes
2. No
3. Not sure`,
    options: ["Yes", "No", "Not sure"]
  },

  C3Q1C_NRPF_ACKNOWLEDGMENT: {
    text: `Thank you for sharing that. I know this situation can be really difficult. There are still services that can help, and I'll do my best to find the right ones for you.`
  },

  C3Q1C_NRPF_ACKNOWLEDGMENT__SUPPORTER: {
    text: `Thank you for sharing that. I know this situation can be really difficult. There are still services that can help, and I'll do my best to find the right ones for them.`
  },

  C3Q2_DEPENDENT_CHILDREN: {
    text: `Do you have dependent children?

1. Yes
2. No`,
    options: ["Yes", "No"]
  },

  C3Q2_DEPENDENT_CHILDREN__SUPPORTER: {
    text: `Do they have dependent children?

1. Yes
2. No`,
    options: ["Yes", "No"]
  },

  C3Q3_AGE: {
    text: `How old are you?

1. Under 16
2. 16-17
3. 18-20
4. 21-24
5. 25+`,
    options: ["Under 16", "16-17", "18-20", "21-24", "25+"]
  },

  C3Q3_AGE__SUPPORTER: {
    text: `How old are they?

1. Under 16
2. 16-17
3. 18-20
4. 21-24
5. 25+`,
    options: ["Under 16", "16-17", "18-20", "21-24", "25+"]
  },

  C3Q4_GENDER: {
    text: `What is your gender?

Some support services - like accommodation and healthcare - are based on biological factors that affect safety, privacy, or medical needs. That's why we ask about your current biological gender. This helps us make the right recommendations to support you safely and effectively.

We fully respect and support all gender identities. We know this question might not fit perfectly for everyone.

1. Male
2. Female
3. Trans Female (male to female)
4. Trans Male (female to male)`,
    options: ["Male", "Female", "Trans Female (male to female)", "Trans Male (female to male)"]
  },

  C3Q4_GENDER__SUPPORTER: {
    text: `What is their gender?

Some support services - like accommodation and healthcare - are based on biological factors that affect safety, privacy, or medical needs. That's why we ask about their current biological gender. This helps us make the right recommendations to support them safely and effectively.

We fully respect and support all gender identities. We know this question might not fit perfectly for everyone.

1. Male
2. Female
3. Trans Female (male to female)
4. Trans Male (female to male)`,
    options: ["Male", "Female", "Trans Female (male to female)", "Trans Male (female to male)"]
  },

  C3Q5_PREGNANCY: {
    text: `Are you pregnant, or living with someone who is pregnant?

1. Yes
2. No`,
    options: ["Yes", "No"]
  },

  C3Q5_PREGNANCY__SUPPORTER: {
    text: `Are they pregnant, or living with someone who is pregnant?

1. Yes
2. No`,
    options: ["Yes", "No"]
  },

  C3Q6_ETHNICITY: {
    text: `What is your ethnicity?

1. White (British)
2. White (Other)
3. Black (African)
4. Black (Caribbean)
5. Asian
6. Mixed or Multiethnic Groups`,
    options: ["White (British)", "White (Other)", "Black (African)", "Black (Caribbean)", "Asian", "Mixed or Multiethnic Groups"]
  },

  C3Q6_ETHNICITY__SUPPORTER: {
    text: `What is their ethnicity?

1. White (British)
2. White (Other)
3. Black (African)
4. Black (Caribbean)
5. Asian
6. Mixed or Multiethnic Groups`,
    options: ["White (British)", "White (Other)", "Black (African)", "Black (Caribbean)", "Asian", "Mixed or Multiethnic Groups"]
  },

  C3Q7_PHYSICAL_HEALTH: {
    text: `Do you have any physical health conditions we should know about that might affect how an organisation can support you?

1. None
2. Mobility impairment
3. Visual impairment
4. Hearing impairment
5. Verbal impairment
6. Neurological impairment (Parkinson's, Multiple Sclerosis, Stroke)`,
    options: ["None", "Mobility impairment", "Visual impairment", "Hearing impairment", "Verbal impairment", "Neurological impairment (Parkinson's, Multiple Sclerosis, Stroke)"]
  },

  C3Q7_PHYSICAL_HEALTH__SUPPORTER: {
    text: `Do they have any physical health conditions we should know about that might affect how an organisation can support them?

1. None
2. Mobility impairment
3. Visual impairment
4. Hearing impairment
5. Verbal impairment
6. Neurological impairment (Parkinson's, Multiple Sclerosis, Stroke)`,
    options: ["None", "Mobility impairment", "Visual impairment", "Hearing impairment", "Verbal impairment", "Neurological impairment (Parkinson's, Multiple Sclerosis, Stroke)"]
  },

  C3Q8_MENTAL_HEALTH: {
    text: `Some services offer specialist support for people with mental health conditions. You can skip this if you'd prefer.

Do you have any mental health conditions an organisation should know about?

1. None
2. Clinical depression
3. Severe anxiety
4. PTSD
5. Bipolar
6. Schizophrenia
7. Neurodivergence (ADHD, Autism, OCD)
8. Learning difficulties
9. Prefer not to say`,
    options: ["None", "Clinical depression", "Severe anxiety", "PTSD", "Bipolar", "Schizophrenia", "Neurodivergence (ADHD, Autism, OCD)", "Learning difficulties", "Prefer not to say"]
  },

  C3Q8_MENTAL_HEALTH__SUPPORTER: {
    text: `Some services offer specialist support for people with mental health conditions. You can skip this if they'd prefer.

Do they have any mental health conditions an organisation should know about?

1. None
2. Clinical depression
3. Severe anxiety
4. PTSD
5. Bipolar
6. Schizophrenia
7. Neurodivergence (ADHD, Autism, OCD)
8. Learning difficulties
9. Prefer not to say`,
    options: ["None", "Clinical depression", "Severe anxiety", "PTSD", "Bipolar", "Schizophrenia", "Neurodivergence (ADHD, Autism, OCD)", "Learning difficulties", "Prefer not to say"]
  },

  C3Q9_CRIMINAL_CONVICTIONS: {
    text: `Do you have any unspent criminal convictions? Some services have restrictions, so this helps me find the right ones for you.

If you're not sure whether a conviction is spent, you can find out more here: https://unlock.org.uk/disclosure-calculator/

If your conviction is spent, you don't need to tell us or your housing provider.

For any concerns about disclosing convictions when looking for housing, you can find helpful advice here: https://unlock.org.uk/guide/housing/

1. None
2. Arson
3. Sexual Offences
4. Violent Offences
5. Prefer not to say`,
    options: ["None", "Arson", "Sexual Offences", "Violent Offences", "Prefer not to say"]
  },

  C3Q9_CRIMINAL_CONVICTIONS__SUPPORTER: {
    text: `Do they have any unspent criminal convictions? Some services have restrictions, so this helps me find the right ones for them.

If they're not sure whether a conviction is spent, they can find out more here: https://unlock.org.uk/disclosure-calculator/

If their conviction is spent, they don't need to tell us or their housing provider.

For any concerns about disclosing convictions when looking for housing, they can find helpful advice here: https://unlock.org.uk/guide/housing/

1. None
2. Arson
3. Sexual Offences
4. Violent Offences
5. Prefer not to say`,
    options: ["None", "Arson", "Sexual Offences", "Violent Offences", "Prefer not to say"]
  },

  C3Q10_LGBTQ: {
    text: `Do you identify with the LGBTQ+ community?

1. Yes
2. No`,
    options: ["Yes", "No"]
  },

  C3Q10_LGBTQ__SUPPORTER: {
    text: `Do they identify with the LGBTQ+ community?

1. Yes
2. No`,
    options: ["Yes", "No"]
  },

  C3Q10A_LGBTQ_SERVICE_PREFERENCE: {
    text: `Would you prefer services that specialise in supporting LGBTQ+ people? These may be further away but offer specific understanding and support.

1. Yes, show LGBTQ+ specialist services first
2. No, just show local services
3. Show me both`,
    options: ["Yes, show LGBTQ+ specialist services first", "No, just show local services", "Show me both"]
  },

  C3Q10A_LGBTQ_SERVICE_PREFERENCE__SUPPORTER: {
    text: `Would they prefer services that specialise in supporting LGBTQ+ people? These may be further away but offer specific understanding and support.

1. Yes, show LGBTQ+ specialist services first
2. No, just show local services
3. Show both`,
    options: ["Yes, show LGBTQ+ specialist services first", "No, just show local services", "Show both"]
  },

  C3Q11_CURRENTLY_IN_CARE: {
    text: `Are you currently being looked after by social services under the Children's Act 1989?

1. Yes
2. No`,
    options: ["Yes", "No"]
  },

  C3Q11_CURRENTLY_IN_CARE__SUPPORTER: {
    text: `Are they currently being looked after by social services under the Children's Act 1989?

1. Yes
2. No`,
    options: ["Yes", "No"]
  },

  C3Q12_SOCIAL_SERVICES: {
    text: `Are you currently in contact with social services or a social worker?

1. Yes
2. No
3. Prefer not to say`,
    options: ["Yes", "No", "Prefer not to say"]
  },

  C3Q12_SOCIAL_SERVICES__SUPPORTER: {
    text: `Are they currently in contact with social services or a social worker?

1. Yes
2. No
3. Prefer not to say`,
    options: ["Yes", "No", "Prefer not to say"]
  },

  // ============================================================
  // DV ROUTING QUESTIONS
  // ============================================================

  DV_GENDER_ASK: {
    text: `I'm really sorry this is happening to you. So I can point you to the right support, I need to ask:

What is your gender?

1. Female
2. Male
3. Non-binary or other
4. Prefer not to say`,
    options: ["Female", "Male", "Non-binary or other", "Prefer not to say"]
  },

  DV_GENDER_ASK__SUPPORTER: {
    text: `I'm really sorry this is happening to them. So I can point them to the right support, I need to ask:

What is their gender?

1. Female
2. Male
3. Non-binary or other
4. Prefer not to say`,
    options: ["Female", "Male", "Non-binary or other", "Prefer not to say"]
  },

  DV_CHILDREN_ASK: {
    text: `Do you have dependent children?

1. Yes
2. No`,
    options: ["Yes", "No"]
  },

  DV_CHILDREN_ASK__SUPPORTER: {
    text: `Do they have dependent children?

1. Yes
2. No`,
    options: ["Yes", "No"]
  },

  SA_GENDER_ASK: {
    text: `I'm really sorry this has happened. So I can point you to the right support, I need to ask:

What is your gender?

1. Female
2. Male
3. Non-binary or other
4. Prefer not to say`,
    options: ["Female", "Male", "Non-binary or other", "Prefer not to say"]
  },

  SA_GENDER_ASK__SUPPORTER: {
    text: `I'm really sorry this has happened to them. So I can point them to the right support, I need to ask:

What is their gender?

1. Female
2. Male
3. Non-binary or other
4. Prefer not to say`,
    options: ["Female", "Male", "Non-binary or other", "Prefer not to say"]
  },

  // ============================================================
  // SAFEGUARDING EXITS
  // ============================================================

  IMMEDIATE_PHYSICAL_DANGER_EXIT: {
    text: `If you are in immediate danger right now, please call 999.

The police can help keep you safe.

If you cannot speak safely, you can:
- Call 999, then press 55 (Silent Solution - alerts police you need help)
- Text 999 if you have registered for this service

Once you are safe, I can help you find support services.`
  },

  IMMEDIATE_PHYSICAL_DANGER_EXIT__SUPPORTER: {
    text: `If they are in immediate danger right now, please call 999.

The police can help keep them safe.

If they cannot speak safely:
- Call 999, then press 55 (Silent Solution - alerts police they need help)
- Text 999 if registered for this service

Once they are safe, I can help you find support services for them.`
  },

  DV_FEMALE_CHILDREN_YES: {
    text: `I'm really sorry this is happening. You deserve support, and these services are here to help. They can talk through your options, help with safety planning, and connect you with emergency housing if needed. Everything is confidential.

National Domestic Violence Helpline
0808 2000 247 (24/7, free, confidential)
https://nationaldahelpline.org.uk

Shelter - Domestic Violence Advice
https://england.shelter.org.uk/housing_advice/homelessness/priority_need/at_risk_of_domestic_abuse`
  },

  DV_FEMALE_CHILDREN_YES__SUPPORTER: {
    text: `I'm really sorry this is happening to them. They deserve support, and these services are here to help. They can talk through options, help with safety planning, and connect them with emergency housing if needed. Everything is confidential.

National Domestic Violence Helpline
0808 2000 247 (24/7, free, confidential)
https://nationaldahelpline.org.uk

Shelter - Domestic Violence Advice
https://england.shelter.org.uk/housing_advice/homelessness/priority_need/at_risk_of_domestic_abuse`
  },

  DV_FEMALE_CHILDREN_NO: {
    text: `I'm really sorry this is happening. You deserve support, and these services are here to help. They can talk through your options, help with safety planning, and connect you with emergency housing if needed. Everything is confidential.

National Domestic Violence Helpline
0808 2000 247 (24/7, free, confidential)
https://nationaldahelpline.org.uk

Shelter - Domestic Violence Advice
https://england.shelter.org.uk/housing_advice/homelessness/priority_need/at_risk_of_domestic_abuse`
  },

  DV_FEMALE_CHILDREN_NO__SUPPORTER: {
    text: `I'm really sorry this is happening to them. They deserve support, and these services are here to help. They can talk through options, help with safety planning, and connect them with emergency housing if needed. Everything is confidential.

National Domestic Violence Helpline
0808 2000 247 (24/7, free, confidential)
https://nationaldahelpline.org.uk

Shelter - Domestic Violence Advice
https://england.shelter.org.uk/housing_advice/homelessness/priority_need/at_risk_of_domestic_abuse`
  },

  DV_MALE_CHILDREN_YES: {
    text: `I'm really sorry this is happening. You deserve support, and these services are here to help. They can talk through your options, help with safety planning, and connect you with emergency housing if needed. Everything is confidential.

ManKind Initiative
0808 800 1170
https://mankind.org.uk
Confidential support for men affected by domestic violence`
  },

  DV_MALE_CHILDREN_YES__SUPPORTER: {
    text: `I'm really sorry this is happening to them. They deserve support, and these services are here to help. They can talk through options, help with safety planning, and connect them with emergency housing if needed. Everything is confidential.

ManKind Initiative
0808 800 1170
https://mankind.org.uk
Confidential support for men affected by domestic violence`
  },

  DV_MALE_CHILDREN_NO: {
    text: `I'm really sorry this is happening. You need support from people who can help right now.

ManKind Initiative
0808 800 1170
https://mankind.org.uk`
  },

  DV_MALE_CHILDREN_NO__SUPPORTER: {
    text: `I'm really sorry this is happening to them. They need support from people who can help right now.

ManKind Initiative
0808 800 1170
https://mankind.org.uk`
  },

  DV_LGBTQ_CHILDREN_YES: {
    text: `I'm really sorry this is happening. You need support from people who can help right now.

Galop
0800 999 5428
https://galop.org.uk
National helpline for LGBTQ+ people affected by abuse or violence`
  },

  DV_LGBTQ_CHILDREN_YES__SUPPORTER: {
    text: `I'm really sorry this is happening to them. They need support from people who can help right now.

Galop
0800 999 5428
https://galop.org.uk
National helpline for LGBTQ+ people affected by abuse or violence`
  },

  DV_LGBTQ_CHILDREN_NO: {
    text: `I'm really sorry this is happening. You need support from people who can help right now.

Galop
0800 999 5428
https://galop.org.uk`
  },

  DV_LGBTQ_CHILDREN_NO__SUPPORTER: {
    text: `I'm really sorry this is happening to them. They need support from people who can help right now.

Galop
0800 999 5428
https://galop.org.uk`
  },

  SA_FEMALE_16PLUS: {
    text: `I'm really sorry this has happened. You need support from people who can help right now.

Rape Crisis England & Wales
0808 500 2222 (Free, confidential, 24/7)
https://rapecrisis.org.uk`
  },

  SA_FEMALE_16PLUS__SUPPORTER: {
    text: `I'm really sorry this has happened to them. They need support from people who can help right now.

Rape Crisis England & Wales
0808 500 2222 (Free, confidential, 24/7)
https://rapecrisis.org.uk`
  },

  SA_MALE_16PLUS: {
    text: `I'm really sorry this has happened. You need support from people who can help right now.

SurvivorsUK
020 3598 3898
https://survivorsuk.org
Specialist, confidential support for men and boys aged 16 and over`
  },

  SA_MALE_16PLUS__SUPPORTER: {
    text: `I'm really sorry this has happened to them. They need support from people who can help right now.

SurvivorsUK
020 3598 3898
https://survivorsuk.org
Specialist, confidential support for men and boys aged 16 and over`
  },

  SA_LGBTQ_OR_NONBINARY: {
    text: `I'm really sorry this has happened. You need support from people who can help right now.

SurvivorsUK
020 3598 3898
https://survivorsuk.org

Galop
0800 999 5428
https://galop.org.uk`
  },

  SA_LGBTQ_OR_NONBINARY__SUPPORTER: {
    text: `I'm really sorry this has happened to them. They need support from people who can help right now.

SurvivorsUK
020 3598 3898
https://survivorsuk.org

Galop
0800 999 5428
https://galop.org.uk`
  },

  SELF_HARM_EXIT: {
    text: `You deserve support with this, and you do not have to go through it alone.

Samaritans: 116 123 (24 hours, free)
https://samaritans.org

NHS Mental Health Helpline: call 111 and choose option 2

If you are in immediate danger, call 999 or go to A and E.`
  },

  SELF_HARM_EXIT__SUPPORTER: {
    text: `They deserve support with this, and they do not have to go through it alone.

You can encourage them to contact:

Samaritans: 116 123 (24 hours, free)
https://samaritans.org

NHS Mental Health Helpline: call 111 and choose option 2

If they are in immediate danger, call 999 or go to A and E.`
  },

  UNDER_16_EXIT: {
    text: `Thank you for reaching out. Because you are under 16, there are specific services designed to help keep you safe.

The best next step is to contact your local Children's Services team.

Childline: 0800 1111 (free and confidential)

If you are in immediate danger, call 999.`
  },

  UNDER_16_EXIT__SUPPORTER: {
    text: `Thank you for reaching out. Because they are under 16, there are specific services designed to help keep them safe.

The best next step is to contact the local Children's Services team.

Childline: 0800 1111 (free and confidential, for young people)
NSPCC: 0808 800 5000 (for adults concerned about a child)

If they are in immediate danger, call 999.`
  },

  FIRE_FLOOD_EXIT: {
    text: `Losing your home due to fire, flood, or another emergency is frightening, and it makes sense to want urgent help.

Local councils assess emergency housing situations urgently.

Please contact your local council's Housing Options team as soon as you can so they can assess what support may be available.

Find your local council: https://www.gov.uk/find-local-council

Shelter: 0808 800 4444 (free, 8am-8pm weekdays, 9am-5pm weekends)
https://england.shelter.org.uk`
  },

  FIRE_FLOOD_EXIT__SUPPORTER: {
    text: `Losing their home due to fire, flood, or another emergency is frightening, and it makes sense to want urgent help.

Local councils assess emergency housing situations urgently.

Please contact the local council's Housing Options team as soon as you can so they can assess what support may be available.

Find the local council: https://www.gov.uk/find-local-council

Shelter: 0808 800 4444 (free, 8am-8pm weekdays, 9am-5pm weekends)
https://england.shelter.org.uk`
  },

  CHILD_AT_RISK_EXIT: {
    text: `Thank you for sharing this. When a child's safety is at risk, it's important to get the right people involved.

NSPCC: 0808 800 5000 (for adults concerned about a child)
Childline: 0800 1111 (for children and young people)

If a child is in immediate danger, call 999.`
  },

  // ============================================================
  // STREETLINK
  // ============================================================

  STREETLINK_SIGNPOST: {
    text: `If you'd like to, you can make a StreetLink alert. This lets your local outreach team know where you are so they can try to find you and offer support. You can do that here:
https://streetlink.org.uk

Once you submit the alert, your information goes straight to a local outreach team. They'll do their best to find you, check in, and connect you with the right help.

StreetLink doesn't provide housing directly, but it helps link people sleeping rough with services that can.

In the meantime, keep chatting with me. I can help you look for more support now.`
  },

  // ============================================================
  // TERMINAL
  // ============================================================

  TERMINAL_CHECKIN: {
    text: `I hope this helps. Is there anything else I can help with today?`
  },

  TERMINAL_CHECKIN__SUPPORTER: {
    text: `I hope this helps them. Is there anything else I can help with today?`
  },

  TERMINAL_ADDITIONAL_NEEDS: {
    text: `Is there anything else you're looking for help with today?

1. Yes, I have another need
2. No, that's everything`,
    options: ["Yes, I have another need", "No, that's everything"]
  },

  TERMINAL_ADDITIONAL_NEEDS__SUPPORTER: {
    text: `Is there anything else they need help with today?

1. Yes, there's another need
2. No, that's everything`,
    options: ["Yes, there's another need", "No, that's everything"]
  },

  TERMINAL_GOODBYE: {
    text: `Take care of yourself. You can come back anytime if you need more help.`
  },

  TERMINAL_GOODBYE__SUPPORTER: {
    text: `Take care. You can come back anytime if they need more help.`
  },

  TERMINAL_SOCIAL_SERVICES_GUIDANCE: {
    text: `Based on your situation, you may be entitled to support from social services. They have a duty to help young people and care leavers with housing.

You can contact your local council and ask for the Children's Services or Leaving Care team.

Find your local council: https://www.gov.uk/find-local-council`
  },

  // ============================================================
  // SCOPE & FALLBACKS
  // ============================================================

  OUT_OF_SCOPE_GENERAL: {
    text: `I can't help with that. I'm designed specifically to help people find housing and homelessness support services.

Is there anything related to housing, homelessness, or support services I can help you with?`
  },

  OUT_OF_SCOPE_AFTER_TERMINAL: {
    text: `I can't help with that request. I'm here to connect you with housing and homelessness support services in your area.

If you need help finding additional support services, I can ask you a few questions to understand what you're looking for.`
  },

  WMCA_ONLY_SCOPE_NOTICE: {
    text: `This assistant is currently available for Birmingham, Coventry, Dudley, Sandwell, Solihull, Walsall, and Wolverhampton.

If you're in a different area, please visit your local authority's website or contact their Housing Options team directly.

I can still provide general information about how homelessness support usually works if that would be helpful.`
  },

  LOCAL_AUTHORITY_FALLBACK: {
    text: `Contact your local council's Housing Options team. You can find their details at https://www.gov.uk/find-local-council`
  },

  LOCAL_AUTHORITY_FALLBACK_EXTENDED: {
    text: `Contact your local council's Housing Options or homelessness team. They have a legal duty to help.

Find your local council: https://www.gov.uk/find-local-council

If you need immediate advice:
Shelter: 0808 800 4444 (free, 8am-8pm weekdays, 9am-5pm weekends)
https://england.shelter.org.uk`
  },

  // ============================================================
  // ESCALATION
  // ============================================================

  ESCALATION_LEVEL_1_BRIDGE: {
    text: `It looks like this is not connecting smoothly, and that is okay. These questions do not fit every situation.

Would you like to:
1. Explain things in a different way
2. Skip this question and move on
3. Start again from the beginning

What feels easiest right now?`,
    options: ["Explain things in a different way", "Skip this question and move on", "Start again from the beginning"]
  },

  ESCALATION_LEVEL_2_INTERVENTION: {
    text: `I can see this is feeling difficult, and that is completely understandable. These questions do not work for everyone.

I can help in a few different ways:

1. Look for services using what I know so far, even if it is incomplete
2. Share a phone number so you can speak to someone directly
3. Carry on with the questions if you would like to try

What would be most helpful right now?`,
    options: ["Look for services using what I know so far", "Share a phone number to speak to someone", "Carry on with the questions"]
  },

  ESCALATION_LEVEL_2_INTERVENTION__SUPPORTER: {
    text: `I can see this is feeling difficult, and that is completely understandable. These questions do not work for everyone.

I can help in a few different ways:

1. Look for services using what is known so far, even if it is incomplete
2. Share a phone number they can use to speak to someone directly
3. Carry on with the questions if they would like to try

What would be most helpful right now?`,
    options: ["Look for services using what is known so far", "Share a phone number to speak to someone", "Carry on with the questions"]
  },

  ESCALATION_LEVEL_2_LEGAL_EMERGENCY: {
    text: `This sounds urgent. With an eviction notice, there are specific legal steps that need to happen, and getting the right advice quickly can make a real difference.

Shelter: 0808 800 4444 (free, 8am-8pm weekdays, 9am-5pm weekends)
https://england.shelter.org.uk/get_help/helpline

Citizens Advice: https://www.citizensadvice.org.uk/housing/

They can check if the notice is valid and explain your options.`
  },

  ESCALATION_LEVEL_2_CHILDREN_RISK: {
    text: `When children are involved and housing is at risk, there are extra protections available. Local councils have a duty to help prevent homelessness for families with children.

Please contact your local council's Housing Options team as soon as possible. They should assess your situation urgently.

Shelter: 0808 800 4444 (free)
https://england.shelter.org.uk`
  },

  ESCALATION_LEVEL_2_HEALTH_CRISIS: {
    text: `It sounds like you're dealing with a lot right now. Health and housing are closely connected, and there are services that understand both.

If you're in a health crisis right now:
NHS 111 - for urgent but non-emergency health needs
999 - for emergencies

For housing support alongside health:
Shelter: 0808 800 4444 (free)
https://england.shelter.org.uk`
  },

  ESCALATION_LEVEL_3_EXIT: {
    text: `I can see this isn't working for you right now, and I'm sorry I couldn't help in the way you needed. That's okay - there are other ways to get support.

These services can help:

Shelter Emergency Helpline
0808 800 4444 (free, 8am-8pm weekdays, 9am-5pm weekends)
https://england.shelter.org.uk/get_help/helpline

Crisis
https://crisis.org.uk/get-help

Whatever you're going through, you deserve support. You're welcome back anytime.`
  },

  // ============================================================
  // ADVICE CONTENT KEYS
  // ============================================================

  ADVICE_COUNCIL_PROCESS: {
    text: `When you approach your local council for help with housing, here's what usually happens:

1. You'll speak to someone in the Housing Options team
2. They'll ask about your situation and do an assessment
3. If you're homeless or at risk, they have duties to help
4. You may be offered temporary accommodation while they investigate
5. They'll make a decision about what help they can provide

The council must give you a written decision. If you disagree, you can ask for a review.

Shelter has detailed guides: https://england.shelter.org.uk/housing_advice/homelessness`
  },

  ADVICE_PRIORITY_NEED: {
    text: `In England, councils must provide accommodation to people who are homeless and in 'priority need'. This includes:

- People with dependent children
- Pregnant women
- People who are vulnerable due to health, disability, or other reasons
- Young people aged 16-17
- Care leavers aged 18-20
- People made homeless by fire, flood, or emergency
- People fleeing domestic abuse

Even if you don't think you're in priority need, the council still has duties to help prevent homelessness and help you find somewhere to live.

More info: https://england.shelter.org.uk/housing_advice/homelessness/priority_need`
  },

  ADVICE_LEGALLY_HOMELESS: {
    text: `You're considered legally homeless if:

- You have nowhere you can stay
- You can't access your home (for example, it's not safe)
- You're staying somewhere temporarily with no right to stay
- You're living somewhere that's not reasonable to continue living in

You don't have to be sleeping rough to be homeless. Sofa surfing or staying in unsuitable conditions counts too.

The council can help before you actually lose your home - this is called 'threatened with homelessness' and kicks in 56 days before you'll become homeless.`
  },

  ADVICE_SOFA_SURFING: {
    text: `Staying on someone's sofa or floor counts as being homeless in law. You're not expected to stay there forever, and it's not secure housing.

You have the right to approach your local council for help. They should:
- Accept a homelessness application from you
- Work with you to find somewhere more stable
- Possibly provide temporary accommodation while they help

Don't wait until you're asked to leave - you can approach the council now.

Shelter: 0808 800 4444
https://england.shelter.org.uk/housing_advice/homelessness/sofa_surfing`
  },

  ADVICE_EVICTION_RISK_PREVENTION: {
    text: `If your landlord wants you to leave or you've received a notice, don't panic. There are rules they must follow, and you may have more time than you think.

Key things to know:
- Most notices require at least 2 months warning (Section 21) or specific grounds (Section 8)
- You don't have to leave just because the notice period ends - only a court can evict you
- The council can help prevent homelessness up to 56 days before you'd need to leave

Get advice quickly:
Shelter: 0808 800 4444 (free)
Citizens Advice: https://www.citizensadvice.org.uk/housing/renting-privately/ending-your-tenancy/`
  },

  ADVICE_SLEEP_TONIGHT: {
    text: `If you need somewhere to sleep tonight:

1. Contact your local council's Housing Options team - they have a duty to help if you're homeless tonight. Many have out-of-hours numbers.

2. StreetLink can alert local outreach services to your location: https://streetlink.org.uk

3. Shelter's helpline: 0808 800 4444

4. Local night shelters and hostels - I can help you find these if you tell me your area.

Your safety matters. If you're in danger, call 999.`
  },

  ADVICE_RENT_ARREARS_EARLY_HELP_ENGLAND: {
    text: `If you're struggling to pay rent, act early - there's more help available than you might think.

Steps to take:
1. Talk to your landlord - explain your situation, many will work with you
2. Check what benefits you might be entitled to (Universal Credit, Housing Benefit)
3. Contact your council - they may have Discretionary Housing Payments available
4. Get debt advice - organisations like StepChange can help you manage overall debt

Important: Your landlord cannot evict you just for being in arrears. They must follow a legal process, which takes time.

Citizens Advice: https://www.citizensadvice.org.uk/debt-and-money/rent-arrears/
Shelter: 0808 800 4444`
  },

  ADVICE_RENT_ARREARS_EARLY_HELP_SCOTLAND: {
    text: `If you're struggling to pay rent in Scotland, help is available.

In Scotland, eviction rules are different - your landlord must apply to a tribunal to evict you, and the process takes time.

Steps to take:
1. Speak to your landlord early
2. Check your benefit entitlement
3. Contact your council about Discretionary Housing Payments
4. Get advice from Shelter Scotland: 0808 800 4444

More info: https://scotland.shelter.org.uk/housing_advice/paying_for_a_home/rent_arrears`
  },

  ADVICE_LANDLORD_PRESSURE_OR_NOTICE_ENGLAND: {
    text: `If your landlord is pressuring you to leave or has given you a notice:

Know your rights:
- You don't have to leave immediately when a notice expires
- Only a court can legally evict you
- Your landlord cannot change locks, remove belongings, or harass you
- If they do, this may be illegal eviction

What to do:
1. Check if the notice is valid - there are strict rules
2. Don't leave until you've had advice
3. Contact Shelter or Citizens Advice immediately

Shelter: 0808 800 4444
https://england.shelter.org.uk/housing_advice/eviction`
  },

  ADVICE_LANDLORD_PRESSURE_OR_NOTICE_SCOTLAND: {
    text: `If your landlord is pressuring you to leave or has given you a notice in Scotland:

In Scotland, the eviction process goes through a tribunal, not the courts. Your landlord must:
- Give proper written notice
- Apply to the First-tier Tribunal
- Get an eviction order

You have rights:
- You don't have to leave just because the notice period ends
- Changing locks or harassment is illegal

Get advice:
Shelter Scotland: 0808 800 4444
https://scotland.shelter.org.uk/housing_advice/eviction`
  },

  ADVICE_MORTGAGE_ARREARS_ENGLAND: {
    text: `If you're struggling with mortgage payments:

Your lender must follow a process before repossessing your home:
1. They should try to work out a payment arrangement with you
2. Repossession requires a court order
3. You can apply to delay the order if you can show a payment plan

Get help:
- Talk to your lender about payment options
- Check if you can claim Support for Mortgage Interest
- Speak to a free debt advisor

Citizens Advice: https://www.citizensadvice.org.uk/debt-and-money/mortgage-problems/
Shelter: 0808 800 4444`
  },

  ADVICE_MORTGAGE_ARREARS_SCOTLAND: {
    text: `If you're struggling with mortgage payments in Scotland:

Your lender must follow the pre-action requirements:
- Give you information about your options
- Try to agree a reasonable repayment plan
- Consider alternatives to repossession

Get help:
- Contact your lender early
- Check Support for Mortgage Interest eligibility
- Get free advice

Shelter Scotland: 0808 800 4444
https://scotland.shelter.org.uk/housing_advice/mortgage_problems`
  },

  ADVICE_STAYING_WITH_OTHERS_ENGLAND: {
    text: `If you've been asked to leave by family or friends, or you're worried they might ask you to leave:

You may be legally homeless if:
- You have no right to stay where you are
- You're being asked to leave
- Your situation is unstable or temporary

The council has a duty to help prevent homelessness up to 56 days before you'd have to leave.

What to do:
1. Approach your local council's Housing Options team
2. Explain your situation - you don't need a formal notice
3. Ask about your housing options

Shelter: 0808 800 4444`
  },

  ADVICE_STAYING_WITH_OTHERS_SCOTLAND: {
    text: `If you've been asked to leave by family or friends in Scotland, or you're worried they might:

You can approach your local council for help. In Scotland, the council has duties to assess your situation and provide advice.

You may be considered homeless if you have no legal right to stay where you are.

Contact:
- Your local council's housing team
- Shelter Scotland: 0808 800 4444
https://scotland.shelter.org.uk/housing_advice/homelessness`
  },

  ADVICE_FINANCIAL_HARDSHIP_ENGLAND: {
    text: `If financial difficulties are affecting your housing:

Help that might be available:
- Universal Credit or Housing Benefit for rent
- Council Tax Reduction
- Discretionary Housing Payments from your council
- Local welfare assistance schemes
- Charitable grants

Get debt advice:
- StepChange: https://www.stepchange.org/
- Citizens Advice: https://www.citizensadvice.org.uk/debt-and-money/
- Turn2us grants search: https://www.turn2us.org.uk/`
  },

  ADVICE_FINANCIAL_HARDSHIP_SCOTLAND: {
    text: `If financial difficulties are affecting your housing in Scotland:

Help that might be available:
- Universal Credit or Housing Benefit
- Council Tax Reduction
- Discretionary Housing Payments
- Scottish Welfare Fund (Crisis Grants and Community Care Grants)

Get advice:
- Citizens Advice Scotland: https://www.cas.org.uk/
- StepChange Scotland: https://www.stepchange.org/
- Shelter Scotland: 0808 800 4444`
  },

  ADVICE_REGISTER_SOCIAL_HOUSING: {
    text: `To apply for council or housing association housing:

1. Register on your local council's housing list (sometimes called the housing register or Choice-Based Lettings)
2. You'll usually need a local connection to the area
3. Your application will be assessed and given priority based on your circumstances
4. Properties are advertised and you 'bid' on ones you're interested in

Priority is usually given to people who are:
- Homeless or at risk of homelessness
- Living in overcrowded conditions
- Have health needs affected by housing
- Need to move for work or family reasons

Contact your local council's housing team to apply.`
  },

  ADVICE_REPORT_ROUGH_SLEEPING: {
    text: `If you're sleeping rough or know someone who is:

StreetLink connects people sleeping rough with local services. You can:
- Report via the website: https://streetlink.org.uk
- Use the StreetLink app
- Call: 0300 500 0914

Local outreach teams will try to find the person and offer support with:
- Emergency accommodation
- Health services
- Benefits and ID
- Longer-term housing options

The more details you can provide (location, description, best time to find them), the more likely they can help.`
  },

};

// Helper function
export function getPhrase(key: string, isSupporter: boolean): PhraseEntry | null {
  if (isSupporter) {
    const supporterKey = `${key}__SUPPORTER`;
    if (phrasebank[supporterKey]) {
      return phrasebank[supporterKey];
    }
  }
  return phrasebank[key] || null;
}
