import { useLoaderData, useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import type { Route } from './+types/chat';
import { loadAllEvents } from '../models/loadEvents';
import { getAiMessages, type AiMessage } from '../models/aiMessages';

export function meta(_: Route.MetaArgs) {
  return [{ title: 'Chat — Madison Events' }];
}

export function loader(_: Route.LoaderArgs) {
  const events = loadAllEvents().slice(0, 12);
  return { events };
}

const STUB_MESSAGES = [
  'Hey! We\'d love to see you.',
  'Check out the details!',
  'Any questions? We\'re here!',
  'Join us — it\'ll be a great time!',
  'Limited spots available!',
  'See you there!',
];

const STUB_TIMES = ['2m ago', '15m ago', '1h ago', '3h ago', 'Yesterday', '2d ago'];

const SOURCE_DOT_COLORS: Record<string, string> = {
  MSCR: 'bg-blue-500',
  'UW Madison': 'bg-red-600',
  Isthmus: 'bg-emerald-600',
};

export default function ChatPage() {
  const { events } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [aiMessages, setAiMessages] = useState<AiMessage[]>([]);

  useEffect(() => {
    setAiMessages(getAiMessages());
    // Refresh if user navigates back from events page
    const onFocus = () => setAiMessages(getAiMessages());
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  // Merge AI-messaged events to top of list
  const aiEventIds = new Set(aiMessages.map(m => m.eventId));
  const aiEventList = aiMessages.map(m => events.find(e => e.id === m.eventId)).filter(Boolean);
  const regularEvents = events.filter(e => !aiEventIds.has(e.id));
  const sortedEvents = [...aiEventList, ...regularEvents] as typeof events;

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="px-4 pt-8 pb-3 border-b border-gray-100">
        <h1 className="text-xl font-bold text-gray-900">Messages</h1>
        <p className="text-sm text-gray-400 mt-0.5">Events want to connect with you</p>
      </div>

      <ul>
        {sortedEvents.map((event, i) => {
          const dotColor = SOURCE_DOT_COLORS[event.source] ?? 'bg-gray-400';
          const aiMsg = aiMessages.find(m => m.eventId === event.id);
          const isNew = !!aiMsg;
          const preview = aiMsg?.message ?? STUB_MESSAGES[i % STUB_MESSAGES.length];
          const timeStr = aiMsg
            ? new Date(aiMsg.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
            : STUB_TIMES[i % STUB_TIMES.length];

          return (
            <li key={event.id}>
              <button
                onClick={() => navigate(`/chat/${event.id}`)}
                className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left border-b border-gray-50"
              >
                {/* Avatar */}
                <div className={`w-12 h-12 rounded-full ${dotColor} flex-shrink-0 flex items-center justify-center text-white font-bold text-lg relative`}>
                  {event.title.charAt(0).toUpperCase()}
                  {isNew && (
                    <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-indigo-500 rounded-full border-2 border-white" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`truncate text-sm ${isNew ? 'font-bold text-gray-900' : 'font-semibold text-gray-900'}`}>
                      {event.title}
                    </span>
                    <span className={`text-xs flex-shrink-0 ${isNew ? 'text-indigo-500 font-semibold' : 'text-gray-400'}`}>
                      {timeStr}
                    </span>
                  </div>
                  <p className={`text-sm truncate mt-0.5 ${isNew ? 'text-gray-700 font-medium' : 'text-gray-500'}`}>
                    {preview}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className={`inline-block w-1.5 h-1.5 rounded-full ${dotColor}`} />
                    <span className="text-xs text-gray-400">{event.source}</span>
                    {event.category && (
                      <>
                        <span className="text-xs text-gray-300">·</span>
                        <span className="text-xs text-gray-400">{event.category}</span>
                      </>
                    )}
                  </div>
                </div>

                {isNew && (
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 flex-shrink-0" />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
