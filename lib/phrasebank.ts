// Street Support VA v7 Phrasebank

export interface PhraseEntry {
  text: string;
  options?: string[];
}

export const phrasebank: Record<string, PhraseEntry> = {
  OPENING_LINE: {
    text: "Hello. I'm here to help you find support in your area."
  },
  
  LANG_HINT_LINE: {
    text: "If you'd prefer to use a different language, just reply in that language and I'll do my best to continue."
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
  
DV_GENDER_ASK: {
    text: `I am really sorry this is happening to you. So I can point you to the right support, can I ask:\n\nWhat is your gender?\n\n1. Female\n2. Male\n3. Non-binary or other\n4. Prefer not to say`,
    options: ['Female', 'Male', 'Non-binary or other', 'Prefer not to say']
  },

  DV_CHILDREN_ASK: {
    text: `Do you have children with you or in your care?\n\n1. Yes\n2. No`,
    options: ['Yes', 'No']
  },
  
  GATE1_INTENT: {
    text: `What are you looking for today?

1. Advice (information or explanation)
2. Help connecting to support (we'll guide you through)
3. Details for a specific organisation`,
    options: [
      "Advice (information or explanation)",
      "Help connecting to support",
      "Details for a specific organisation"
    ]
  },

  GATE2_ROUTE_SELECTION: {
    text: `I'll ask a few questions to understand what support might help most.

Which would you prefer?

1. Full Guided Route (tailored support)
2. Quicker Route (general support)`,
    options: [
      "Full Guided Route (tailored support)",
      "Quicker Route (general support)"
    ]
  },

  B1_LOCAL_AUTHORITY: {
    text: `Which local authority are you in?

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
4. Not sure`,
    options: ["Myself", "Someone I'm supporting", "I'm a professional or organisation", "Not sure"]
  },

  B3_AGE_CATEGORY: {
    text: `Which age group are you in?

1. Under 16
2. 16-17
3. 18-24
4. 25 or over`,
    options: ["Under 16", "16-17", "18-24", "25 or over"]
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
    options: ["Emergency Housing", "Food", "Work", "Health Services", "Advice Services", "Drop In", "Financial Help", "Personal Items", "Personal Services", "Communications", "Training", "Activities"]
  },

  B6_HOMELESSNESS_STATUS: {
    text: `Are you currently experiencing homelessness?

That includes if you don't have your own place and you're staying in temporary accommodation, hospital, prison, or somewhere that isn't your permanent home.

1. Yes
2. No`,
    options: ["Yes", "No"]
  },

  B7_HOUSED_SITUATION: {
    text: `Where are you living at the moment?

1. At home (your own tenancy or ownership)
2. Staying temporarily with friends or family
3. Temporary accommodation arranged by the council
4. Other temporary situation`,
    options: ["At home", "Friends or family", "Council temp", "Other temporary"]
  },

  B7_HOMELESS_SLEEPING_SITUATION: {
    text: `Where are you sleeping at the moment?

1. Outside or somewhere not meant for sleeping
2. Staying with different friends or family (sofa surfing)
3. Hostel or night shelter
4. B&B or hotel paid for by the council
5. Somewhere else temporary`,
    options: ["Rough sleeping", "Sofa surfing", "Hostel", "B&B", "Other temporary"]
  },

  B7A_PREVENTION_GATE: {
    text: `Are you worried about losing your home?

1. Yes, I'm at risk of losing my home
2. No, I'm just looking for general information
3. Actually, I need to change my previous answer`,
    options: ["Yes, at risk", "No, just info", "Change answer"]
  },

  IMMEDIATE_PHYSICAL_DANGER_EXIT: {
    text: `If you are in immediate danger right now, please call 999.

The police can help keep you safe.

If you cannot speak safely:
- Call 999, then press 55 (Silent Solution)
- Text 999 if registered

Once you are safe, I can help you find support services.`
  },

  SELF_HARM_EXIT: {
    text: `You deserve support with this, and you do not have to go through it alone.

Samaritans: 116 123 (24 hours, free)
https://samaritans.org

NHS Mental Health Helpline: call 111 and choose option 2

If you are in immediate danger, call 999 or go to A and E.`
  },

  UNDER_16_EXIT: {
    text: `Thank you for reaching out. Because you are under 16, there are specific services designed to help keep you safe.

Childline: 0800 1111 (free and confidential)

If you are in immediate danger, call 999.`
  },

  DV_FEMALE_CHILDREN_NO: {
    text: `I'm really sorry this is happening. You deserve support.

National Domestic Violence Helpline
0808 2000 247 (24/7, free, confidential)
https://nationaldahelpline.org.uk

Shelter - Domestic Violence Advice
https://england.shelter.org.uk/housing_advice/homelessness/priority_need/at_risk_of_domestic_abuse`
  },

  SA_EXIT: {
    text: `I'm really sorry this has happened. You deserve support.

Rape Crisis England & Wales
0808 500 2222
https://rapecrisis.org.uk

The Survivors Trust
0808 801 0818

If you are in immediate danger, call 999.`
  },

  FIRE_FLOOD_EXIT: {
    text: `I'm sorry to hear about the emergency. Your local council has a legal duty to help you find somewhere to stay.

Contact your council's Housing Options team as soon as possible.

Shelter: 0808 800 4444 (free)
https://england.shelter.org.uk

If anyone is in immediate danger, call 999.`
  },

  WMCA_ONLY_SCOPE_NOTICE: {
    text: `I can currently only help find services in the West Midlands area (Birmingham, Coventry, Dudley, Sandwell, Solihull, Walsall, Wolverhampton).

For support in other areas:
Shelter: 0808 800 4444
https://england.shelter.org.uk`
  },

  ESCALATION_LEVEL_2_INTERVENTION: {
    text: `I want to make sure you get the help you need. Here are some options:

1. Continue with the questions
2. I can show you services based on what I know so far
3. Speak to someone directly: Shelter 0808 800 4444 (free)`
  },

  TERMINAL_ADDITIONAL_NEEDS: {
    text: `Is there anything else I can help you find support for today?

1. Yes, I have another need
2. No, that's everything`,
    options: ["Yes, another need", "No, that's everything"]
  },

  TERMINAL_GOODBYE: {
    text: `Take care. You can come back anytime if you need more help.`
  },

  OUT_OF_SCOPE_GENERAL: {
    text: `I can only help with housing, homelessness, and related support services.

Is there something related to housing or homelessness I can help you with?`
  }
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
