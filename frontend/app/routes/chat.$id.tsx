import { useLoaderData, useNavigate } from 'react-router';
import { useEffect, useRef, useState } from 'react';
import type { Route } from './+types/chat.$id';
import { loadAllEvents } from '../models/loadEvents';
import { getAiMessageForEvent } from '../models/aiMessages';
import type { Event } from '../models/event';

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

type Message = { role: 'event' | 'user'; text: string };

function buildInitialMessages(event: Event): Message[] {
  const aiMsg = getAiMessageForEvent(event.id);
  const opener = aiMsg?.message ?? `Hey! We'd love to see you at ${event.title}.`;
  const followUp = event.location
    ? `We're at ${event.location}${event.date ? ` on ${event.date}` : ''}.`
    : event.date
      ? `Mark your calendar — we're on ${event.date}!`
      : 'Check our page for the latest details.';
  return [
    { role: 'event', text: opener },
    { role: 'event', text: followUp },
  ];
}

export default function ChatConversation() {
  const { event } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>(() =>
    event ? buildInitialMessages(event) : []
  );
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <p className="text-gray-400">Event not found.</p>
      </div>
    );
  }

  const avatarColor = SOURCE_COLORS[event.source] ?? 'bg-gray-400';

  async function sendMessage() {
    const text = input.trim();
    if (!text || sending) return;

    const userMsg: Message = { role: 'user', text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setSending(true);

    try {
      // Build Anthropic-format history from all messages
      const history = nextMessages.map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.text,
      })) as { role: 'user' | 'assistant'; content: string }[];

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event, history }),
      });

      if (res.ok) {
        const { text: replyText } = await res.json() as { text: string };
        setMessages(prev => [...prev, { role: 'event', text: replyText }]);
      }
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white flex-shrink-0">
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
        <p className="text-xs text-gray-400 text-center mb-2">{event.date || 'Upcoming event'}</p>

        {messages.map((msg, i) =>
          msg.role === 'event' ? (
            <div key={i} className="flex items-end gap-2 max-w-[80%]">
              <div className={`w-7 h-7 rounded-full ${avatarColor} flex-shrink-0 flex items-center justify-center text-white text-xs font-bold`}>
                {event.title.charAt(0).toUpperCase()}
              </div>
              <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-2.5">
                <p className="text-sm text-gray-800">{msg.text}</p>
              </div>
            </div>
          ) : (
            <div key={i} className="flex justify-end">
              <div className="bg-indigo-500 rounded-2xl rounded-br-sm px-4 py-2.5 max-w-[80%]">
                <p className="text-sm text-white">{msg.text}</p>
              </div>
            </div>
          )
        )}

        {sending && (
          <div className="flex items-end gap-2 max-w-[80%]">
            <div className={`w-7 h-7 rounded-full ${avatarColor} flex-shrink-0 flex items-center justify-center text-white text-xs font-bold`}>
              {event.title.charAt(0).toUpperCase()}
            </div>
            <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1 items-center">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="px-4 py-3 border-t border-gray-100 bg-white flex items-center gap-2 flex-shrink-0">
        <input
          ref={inputRef}
          type="text"
          placeholder="Message..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={sending}
          className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none disabled:opacity-50"
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || sending}
          aria-label="Send"
          className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center text-white transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
          </svg>
        </button>
      </div>
    </div>
  );
}
