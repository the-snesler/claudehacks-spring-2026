import type { IsthmusPage, IsthmusResult, IsthmusJsonLd } from './sources';
import type { Event } from './event';

function extractJsonLd(html: string): IsthmusJsonLd | null {
  const match = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  if (!match) return null;
  try {
    return JSON.parse(match[1]) as IsthmusJsonLd;
  } catch {
    return null;
  }
}

function formatIsthmusDate(startDate?: string): string {
  if (!startDate) return '';
  try {
    return new Date(startDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return startDate;
  }
}

function adaptResult(result: IsthmusResult): Event | null {
  const ld = extractJsonLd(result.html);
  if (!ld) return null;

  const categoryMatch = result.html.match(/<p class="cats">([^<]+)<\/p>/);
  const category = categoryMatch ? categoryMatch[1].trim() : undefined;

  return {
    id: `isthmus-${result.urlname}`,
    title: ld.name || result.title,
    description: ld.description || ld.name || result.title,
    date: formatIsthmusDate(ld.startDate),
    time: ld.startDate
      ? new Date(ld.startDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      : undefined,
    location: ld.location?.name ?? undefined,
    category,
    tags: [],
    isFree: false,
    imageUrl: ld.image ?? undefined,
    source: 'Isthmus',
  };
}

export function adaptIsthmusPages(pages: IsthmusPage[]): Event[] {
  const events: Event[] = [];
  const seen = new Set<string>();
  for (const page of pages) {
    for (const result of page.results) {
      if (seen.has(result.urlname)) continue;
      seen.add(result.urlname);
      const event = adaptResult(result);
      if (event) events.push(event);
    }
  }
  return events;
}
