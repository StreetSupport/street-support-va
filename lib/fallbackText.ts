/**
 * The fallback text, with no data imports, so the chat widget can use it when
 * the server cannot be reached. Fixed text, never generated (AI Usage
 * Boundaries Contract, "Failure and Fallback").
 *
 * Shelter checked at source, 11 November 2026 (contract): 0808 800 4444,
 * Monday to Friday 8am to 5pm, closed weekends and bank holidays.
 */
export type HousingOptions = {
  name?: string;
  phone?: string;
  phoneOption?: string;
  phoneHours?: string;
  phoneNote?: string;
  phoneOOH?: string;
  phoneOOHNote?: string;
};

export function buildFallbackText(
  council: HousingOptions | null,
  options: { isSupporter?: boolean; selfHarm?: boolean } = {}
): string {
  const supporter = options.isSupporter === true;
  const lines: string[] = [
    "Sorry, the assistant isn't working properly at the moment, so it can't carry on this conversation. These can still help:",
    'Shelter helpline: 0808 800 4444 (Monday to Friday, 8am to 5pm; closed at weekends and on bank holidays)',
  ];

  if (council?.phone) {
    let line = `${council.name || 'Your council'}: ${council.phone}`;
    if (council.phoneOption) line += `, ${council.phoneOption}`;
    if (council.phoneHours) line += ` (${council.phoneHours})`;
    if (council.phoneNote) line += `. ${council.phoneNote}${/[.!?]$/.test(council.phoneNote) ? '' : '.'}`;
    lines.push(line);
    if (council.phoneOOH) {
      let ooh = `Out of hours: ${council.phoneOOH}. Outside office hours, this is the best route for a housing emergency.`;
      if (council.phoneOOHNote) ooh += ` ${council.phoneOOHNote}`;
      lines.push(ooh);
    } else if (!council.phoneNote) {
      lines.push("Outside office hours, call the council's out-of-hours line. It is the best route for a housing emergency.");
    }
  } else {
    lines.push(
      "Your local council's housing team. Outside office hours, call your council's out-of-hours line. It is the best route for a housing emergency."
    );
  }

  lines.push(
    supporter
      ? 'StreetLink, if the person you are helping is sleeping rough or has nowhere to stay tonight: https://streetlink.org.uk. It lets the local outreach team know. It is not an emergency service.'
      : 'StreetLink, if you are sleeping rough or have nowhere to stay tonight: https://streetlink.org.uk. It lets the local outreach team know. It is not an emergency service.'
  );
  lines.push(
    supporter
      ? 'If you or the person you are helping is in immediate danger, call 999.'
      : 'If you are in immediate danger, call 999.'
  );
  if (options.selfHarm) {
    lines.push('Samaritans: 116 123, free, any time, day or night.');
  }
  return lines.join('\n\n');
}
