import type { UWEvent } from './sources';
import type { Event } from './event';

export function adaptUWEvents(rawEvents: UWEvent[]): Event[] {
  return rawEvents.map((e) => {
    const dateStr = new Date(e.date + 'T12:00:00').toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

    const timeStr = e.time.allDay
      ? undefined
      : new Date(e.time.start).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    const location = e.locations.length > 0 ? e.locations[0].name : undefined;

    return {
      id: `uw-${e.id}`,
      title: e.title,
      description: e.description || e.subtitle.trim() || e.title,
      date: dateStr,
      time: timeStr,
      location,
      category: e.type || 'University',
      tags: [],
      isFree: true,
      source: 'UW Madison',
    };
  });
}
