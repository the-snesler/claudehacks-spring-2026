import { useLoaderData, useNavigate } from 'react-router';
import type { Route } from './+types/chat.$id';
import { loadAllEvents } from '../models/loadEvents';

export function meta({ data }: Route.MetaArgs) {
  return [{ title: data?.event ? `${data.event.title} — Chat` : 'Chat' }];
}

export function loader({ params }: Route.LoaderArgs) {
  const events = loadAllEvents();
  const event = events.find(e => e.id === params.id) ?? null;
  return { event };
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

  const messages = [
    `Hey! We'd love to see you at ${event.title}.`,
    event.location
      ? `We're at ${event.location}${event.date ? ` on ${event.date}` : ''}.`
      : event.date
        ? `Mark your calendar — we're happening on ${event.date}!`
        : 'Check our page for the latest details.',
    'Any questions? Just reply here and we\'ll get back to you!',
  ];

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
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

      {/* Messages */}
      <div className="flex-1 px-4 py-4 flex flex-col gap-3 overflow-y-auto">
        <p className="text-xs text-gray-400 text-center my-2">{event.date || 'Upcoming event'}</p>

        {messages.map((text, i) => (
          <div key={i} className="flex items-end gap-2 max-w-[80%]">
            <div className={`w-7 h-7 rounded-full ${avatarColor} flex-shrink-0 flex items-center justify-center text-white text-xs font-bold`}>
              {event.title.charAt(0).toUpperCase()}
            </div>
            <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-2.5">
              <p className="text-sm text-gray-800">{text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input bar */}
      <div className="px-4 py-3 border-t border-gray-100 bg-white flex items-center gap-2">
        <input
          type="text"
          placeholder="Message..."
          readOnly
          className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none"
        />
        <button
          disabled
          aria-label="Send"
          className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center text-white opacity-40 cursor-not-allowed"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
          </svg>
        </button>
      </div>
    </div>
  );
}
