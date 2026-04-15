import { useLoaderData, useNavigate } from 'react-router';
import type { Route } from './+types/chat';
import { loadAllEvents } from '../models/loadEvents';

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

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="px-4 pt-8 pb-3 border-b border-gray-100">
        <h1 className="text-xl font-bold text-gray-900">Messages</h1>
        <p className="text-sm text-gray-400 mt-0.5">Events want to connect with you</p>
      </div>

      <ul>
        {events.map((event, i) => {
          const dotColor = SOURCE_DOT_COLORS[event.source] ?? 'bg-gray-400';
          return (
            <li key={event.id}>
              <button
                onClick={() => navigate(`/chat/${event.id}`)}
                className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left border-b border-gray-50"
              >
                {/* Avatar */}
                <div className={`w-12 h-12 rounded-full ${dotColor} flex-shrink-0 flex items-center justify-center text-white font-bold text-lg`}>
                  {event.title.charAt(0).toUpperCase()}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-gray-900 truncate text-sm">{event.title}</span>
                    <span className="text-xs text-gray-400 flex-shrink-0">{STUB_TIMES[i % STUB_TIMES.length]}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-sm text-gray-500 truncate">{STUB_MESSAGES[i % STUB_MESSAGES.length]}</span>
                  </div>
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

                {/* Unread dot for first few */}
                {i < 3 && (
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
