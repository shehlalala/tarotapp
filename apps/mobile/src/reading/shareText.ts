/** Plain-text summary of a reading for the system share sheet. Pure, unit tested. */

export interface ShareLine {
  position: string;
  name: string;
  /** Already-translated orientation note, e.g. "reversed", or null when upright. */
  reversedNote: string | null;
  meaning: string;
}

export function buildShareText(title: string, lines: readonly ShareLine[], footer: string): string {
  const body = lines.map((l) => {
    const name = l.reversedNote ? `${l.name} (${l.reversedNote})` : l.name;
    return `${l.position}: ${name}\n${l.meaning}`;
  });
  return [title, ...body, footer].join('\n\n');
}
