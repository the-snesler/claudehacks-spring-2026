import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import type { Route } from './+types/chat';
import { getAiMessages, type AiMessage } from '../models/aiMessages';

export function meta(_: Route.MetaArgs) {
  return [{ title: 'Chat — Madison Events' }];
}

export function loader(_: Route.LoaderArgs) {
  return {};
}

const SOURCE_DOT_COLORS: Record<string, string> = {
  MSCR: 'bg-blue-500',
  'UW Madison': 'bg-red-600',
  Isthmus: 'bg-emerald-600',
};

export default function ChatPage() {
  const navigate = useNavigate();
  const [aiMessages, setAiMessages] = useState<AiMessage[]>([]);

  useEffect(() => {
    setAiMessages(getAiMessages());
    const onFocus = () => setAiMessages(getAiMessages());
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  if (aiMessages.length === 0) {
    return (
      <div className="min-h-[calc(100vh-4rem)]">
        <div className="px-4 pt-8 pb-3 border-b border-gray-100">
          <h1 className="text-xl font-bold text-gray-900">Messages</h1>
        </div>
        <div className="flex flex-col items-center justify-center gap-4 px-8 py-24 text-center">
          <svg viewBox="0 0 24 24" className="w-14 h-14 text-gray-200" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 0 1 1.037-.443 48.282 48.282 0 0 0 5.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
          </svg>
          <p className="text-gray-500 font-medium">No messages yet</p>
          <p className="text-sm text-gray-400">Save some events and an event will reach out!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="px-4 pt-8 pb-3 border-b border-gray-100">
        <h1 className="text-xl font-bold text-gray-900">Messages</h1>
        <p className="text-sm text-gray-400 mt-0.5">{aiMessages.length} event{aiMessages.length !== 1 ? 's' : ''} reached out</p>
      </div>

      <ul>
        {aiMessages.map((msg) => {
          const dotColor = SOURCE_DOT_COLORS[msg.eventTitle.charAt(0)] ?? 'bg-indigo-500';
          const timeStr = new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

          return (
            <li key={msg.eventId}>
              <button
                onClick={() => navigate(`/chat/${msg.eventId}`)}
                className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left border-b border-gray-50"
              >
                <div className="w-12 h-12 rounded-full bg-indigo-500 flex-shrink-0 flex items-center justify-center text-white font-bold text-lg relative">
                  {msg.eventTitle.charAt(0).toUpperCase()}
                  <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-bold text-gray-900">{msg.eventTitle}</span>
                    <span className="text-xs flex-shrink-0 text-indigo-500 font-semibold">{timeStr}</span>
                  </div>
                  <p className="text-sm truncate mt-0.5 text-gray-700 font-medium">{msg.message}</p>
                </div>

                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 flex-shrink-0" />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
