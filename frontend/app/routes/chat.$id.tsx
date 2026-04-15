import { useLoaderData, useNavigate } from 'react-router';
import type { Route } from './+types/chat.$id';
import { loadAllEvents } from '../models/loadEvents';
import { ChatWidget } from '../chat/ChatWidget';
import { chatAction } from '../chat/action';

export function meta({ data }: Route.MetaArgs) {
  return [{ title: data?.event ? `${data.event.title} — Chat` : 'Chat' }];
}

export function loader({ params }: Route.LoaderArgs) {
  const events = loadAllEvents();
  const event = events.find(e => e.id === params.id) ?? null;
  return { event };
}

export async function action(args: any) {
  return chatAction(args);
}

const SOURCE_COLORS: Record<string, string> = {
  MSCR: 'bg-blue-500',
  'UW Madison': 'bg-red-600',
  Isthmus: 'bg-emerald-600',
};

export default function ChatConversation() {
  const { event } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <p className="text-gray-400">Event not found.</p>
      </div>
    );
  }

  const avatarColor = SOURCE_COLORS[event.source] ?? 'bg-gray-400';

  const systemPrompt = `You are a representative for the event "${event.title}".
Here are the event details: ${JSON.stringify(event)}
Answer questions about this event enthusiastically and helpfully. Be concise.`;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white sticky top-0 z-10">
        <button
          onClick={() => navigate('/chat')}
          aria-label="Back"
          className="p-1 -ml-1 text-gray-500 hover:text-gray-800 transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <div className={`w-9 h-9 rounded-full ${avatarColor} flex-shrink-0 flex items-center justify-center text-white font-bold`}>
          {event.title.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 text-sm truncate">{event.title}</p>
          <p className="text-xs text-gray-400">{event.source}</p>
        </div>
      </div>

      <ChatWidget
        endpoint={`/chat/${event.id}`}
        systemPrompt={systemPrompt}
        placeholder={`Ask about ${event.title}...`}
      />
    </div>
  );
}
