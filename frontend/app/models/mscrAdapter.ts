import type { MscrEvent } from './sources';
import type { Event } from './event';

function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate + 'T12:00:00');
  const end = new Date(endDate + 'T12:00:00');
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  const startStr = start.toLocaleDateString('en-US', opts);
  if (startDate === endDate) return startStr;
  const endStr = end.toLocaleDateString('en-US', opts);
  return `${startStr} – ${endStr}`;
}

export function adaptMscrEvent(e: MscrEvent): Event {
  return {
    id: `mscr-${e.id}`,
    title: e.title,
    description: e.description,
    date: formatDateRange(e.startDate, e.endDate),
    time: e.time,
    location: e.address ? `${e.location}, ${e.address}` : e.location,
    category: e.category,
    tags: e.tags,
    isFree: e.isFree,
    fee: e.isFree ? undefined : e.fee,
    source: 'MSCR',
  };
}
