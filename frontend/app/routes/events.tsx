import { useState, useCallback } from 'react';
import { useLoaderData } from 'react-router';
import type { Route } from './+types/events';
import { loadAllEvents } from '../models/loadEvents';
import type { Event, SwipeDirection } from '../models/event';
import SwipeCard from '../components/SwipeCard';

export function meta(_: Route.MetaArgs) {
  return [{ title: 'Madison Events' }];
}

export function loader(_: Route.LoaderArgs) {
  return { events: loadAllEvents() };
}

export default function EventsPage() {
  const { events } = useLoaderData<typeof loader>();
  const [stack, setStack] = useState<Event[]>(events);

  const handleSwipe = useCallback((id: string, _dir: SwipeDirection) => {
    setStack(prev => prev.filter(e => e.id !== id));
  }, []);

  const triggerSwipe = (dir: SwipeDirection) => {
    if (stack.length === 0) return;
    setStack(prev => prev.slice(1));
    // The button path skips the card animation — acceptable for accessibility
    void dir;
  };

  if (stack.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] gap-4 px-6 text-center">
        <svg viewBox="0 0 24 24" className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
        </svg>
        <p className="text-xl font-semibold text-gray-700">You've seen all events in Madison!</p>
        <p className="text-gray-400 text-sm">Check back soon for more.</p>
      </div>
    );
  }

  // Render top 3 cards; top card is last in render order (highest z-index)
  const visible = stack.slice(0, 3);

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-4rem)] pt-8 pb-4 gap-6">
      <h1 className="text-xl font-bold text-gray-900">Madison Events</h1>

      {/* Card stack */}
      <div className="relative w-80 h-[34rem]">
        {visible.map((event, i) => {
          const isTop = i === 0;
          const scale = 1 - (i * 0.04);
          const translateY = i * 10;
          return (
            <SwipeCard
              key={event.id}
              event={event}
              onSwipe={(dir) => handleSwipe(event.id, dir)}
              style={{
                zIndex: visible.length - i,
                transform: isTop ? undefined : `scale(${scale}) translateY(${translateY}px)`,
                pointerEvents: isTop ? 'auto' : 'none',
              }}
            />
          );
        })}
      </div>

      {/* Action buttons */}
      <div className="flex gap-8">
        <button
          onClick={() => triggerSwipe('pass')}
          aria-label="Pass"
          className="w-14 h-14 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <button
          onClick={() => triggerSwipe('save')}
          aria-label="Save"
          className="w-14 h-14 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center text-green-500 hover:bg-green-50 transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 13l4 4L19 7" />
          </svg>
        </button>
      </div>

      <p className="text-xs text-gray-400">{stack.length} events remaining</p>
    </div>
  );
}
