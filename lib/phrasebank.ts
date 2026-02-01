// Street Support VA v7 Phrasebank - FULL VERSION
// Copy-exact phrases from CHAR_VA_Phrasebank_v7.md

export interface PhraseEntry {
  text: string;
  options?: string[];
}

export const phrasebank: Record<string, PhraseEntry> = {

  OPENING_LINE: {
    text: `Hello. I'm here to help you find support in your area.`
  },

  LANG_HINT_LINE: {
    text: `If you'd prefer to use a different language, just reply in that language and I'll do my best to continue.`
  },

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
    options: [
      "Immediate physical danger",
      "Domestic abuse",
      "Sexual violence",
      "Thoughts of harming myself",
      "Under 16 and need protection",
      "Lost home due to fire, flood, or emergency",
      "None of these apply"
    ]
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
    options: [
      "Immediate physical danger",
      "Domestic abuse",
      "Sexual violence",
      "Thoughts of harming themselves",
      "Under 16 and need protection",
      "Lost home due to fire, flood, or emergency",
      "None of these apply"
    ]
  },

  GATE1_INTENT: {
    text: `What are you looking for today?

1. Advice (information or explanation)
2. Help connecting to support (we'll guide you through)
3. Details for a specific organisation`,
    options: [
      "Advice (information or explanation)",
      "Help connecting to support (we'll guide you through)",
      "Details for a specific organisation"
    ]
  },

  GATE2_ROUTE_SELECTION: {
    text: `I'll ask a few questions to understand what support might help most. It usually takes about five minutes.

The full guided route asks about things like health conditions, immigration status, criminal convictions, and other circumstances that might affect which services can help you. Some services are specifically designed for people in particular situations, so these questions help us find the best match.

If none of those apply to you, the quicker route will assume the answers are 'no' or 'none' and get you to relevant services faster.

This is entirely up to you.

Which would you prefer?

1. Full Guided Route (tailored support)
2. Quicker Route (general support)`,
    options: [
      "Full Guided Route (tailored support)",
      "Quicker Route (general support)"
    ]
  },

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
  STREETLINK_SIGNPOST: {
    text: `If you'd like to, you can make a StreetLink alert. This lets your local outreach team know where you are so they can try to find you and offer support. You can do that here:
https://streetlink.org.uk`
  },

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

  ESCALATION_LEVEL_1_BRIDGE: {
    text: `It looks like this is not connecting smoothly, and that is okay. These questions do not fit every situation.

Would you like to:
1. Explain things in a different way
2. Skip this question and move on
3. Start again from the beginning

What feels easiest right now?`,
    options: ["Explain things in a different way", "Skip this question and move on", "Start again from the beginning"]
  },

  ESCALATION_LEVEL_1_BRIDGE__SUPPORTER: {
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

};

export function getPhrase(key: string, isSupporter: boolean): PhraseEntry | null {
  if (isSupporter) {
    const supporterKey = `${key}__SUPPORTER`;
    if (phrasebank[supporterKey]) {
      return phrasebank[supporterKey];
    }
  }
  return phrasebank[key] || null;
}
