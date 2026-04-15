const STORAGE_KEY = 'madison_events_ai_messages';

export type AiMessage = {
  eventId: string;
  eventTitle: string;
  message: string;
  timestamp: number;
};

export function getAiMessages(): AiMessage[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function addAiMessage(msg: AiMessage): void {
  const existing = getAiMessages();
  // Avoid duplicates for same event
  const filtered = existing.filter(m => m.eventId !== msg.eventId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([msg, ...filtered]));
}

export function getAiMessageForEvent(eventId: string): AiMessage | undefined {
  return getAiMessages().find(m => m.eventId === eventId);
}
