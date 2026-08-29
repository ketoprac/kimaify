// Segment math for bulk timesheet rows. Extracted from CreateTimesheetModal
// so the preview count and the submitted payload share one tested source of truth.

export const LUNCH_START = 12 * 60; // 12:00
export const LUNCH_END = 13 * 60; // 13:00
const SEGMENT_MINUTES = 120;

export function minutesBetween(begin: string, end: string): number | null {
  if (!begin || !end) return null;
  const [bh, bm] = begin.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  return eh * 60 + em - (bh * 60 + bm);
}

/**
 * Split a wall-clock span into ≤2h segments, skipping 12:00–13:00 lunch.
 * Spans crossing lunch are cut at 12:00 and resumed at 13:00.
 */
export function splitIntoHours(begin: string, end: string): [string, string][] {
  if (!begin || !end) return [];
  const [bh, bm] = begin.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const start = bh * 60 + bm;
  const finish = eh * 60 + em;

  const segments: [string, string][] = [];
  let cursor = start;
  while (cursor < finish) {
    // Skip over lunch break
    if (cursor >= LUNCH_START && cursor < LUNCH_END) {
      cursor = LUNCH_END;
      continue;
    }
    // Cap segment end at lunch start if it would overlap
    const segEnd = Math.min(cursor + SEGMENT_MINUTES, finish);
    const effectiveEnd = segEnd > LUNCH_START && cursor < LUNCH_START ? LUNCH_START : segEnd;
    segments.push([toHHMM(cursor), toHHMM(effectiveEnd)]);
    cursor = effectiveEnd;
  }
  return segments;
}

function toHHMM(mins: number): string {
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
