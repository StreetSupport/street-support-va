export interface Pronouns {
  they: string;
  their: string;
  them: string;
  theyre: string;
  theyve: string;
}

export function getPronouns(isSupporter: boolean): Pronouns {
  return isSupporter
    ? { they: 'they', their: 'their', them: 'them', theyre: "they're", theyve: "they've" }
    : { they: 'you', their: 'your', them: 'you', theyre: "you're", theyve: "you've" };
}
