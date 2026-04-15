import { useState, useEffect } from "react";
import { loadAllEvents } from "../models/loadEvents";
import type { Event } from "../models/event";

const FALLBACK_IMAGES = ['/images/campus.jpg', '/images/bascom.jpg', '/images/capitol.jpg'];

const SOURCE_COLORS: Record<string, string> = {
  MSCR: 'bg-blue-500',
  'UW Madison': 'bg-red-600',
  Isthmus: 'bg-emerald-600',
};

export default function Saved() {
  const [savedIds, setSavedIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      setSavedIds(JSON.parse(localStorage.getItem("saved_events") || "[]"));
    } catch {
      setSavedIds([]);
    }
  }, []);

  const allEvents = loadAllEvents();
  const saved = allEvents.filter((e) => savedIds.includes(e.id));

  function remove(id: string) {
    const next = savedIds.filter((s) => s !== id);
    setSavedIds(next);
    localStorage.setItem("saved_events", JSON.stringify(next));
  }

  if (saved.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-3 text-gray-400">
        <svg viewBox="0 0 24 24" className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
        </svg>
        <p className="font-medium">No saved events yet</p>
        <p className="text-sm">Swipe right on events you like</p>
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900">Saved · {saved.length}</h1>
        <button onClick={() => { setSavedIds([]); localStorage.removeItem("saved_events"); }} className="text-sm text-red-400 hover:text-red-600 font-medium">
          Clear all
        </button>
      </div>
      <div className="space-y-3">
        {saved.map((event) => {
          const img = event.imageUrl || FALLBACK_IMAGES[event.title.length % 3];
          const dotColor = SOURCE_COLORS[event.source] ?? 'bg-gray-400';
          return (
            <div key={event.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex">
              <img src={img} alt={event.title} className="w-24 h-24 object-cover flex-shrink-0" />
              <div className="flex-1 p-3 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">{event.title}</p>
                  <button onClick={() => remove(event.id)} className="w-7 h-7 rounded-full bg-red-100 hover:bg-red-200 text-red-500 flex items-center justify-center flex-shrink-0 transition-colors">
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                {event.date && <p className="text-xs text-gray-400 mt-1">{event.date}{event.time ? ` · ${event.time}` : ''}</p>}
                {event.location && <p className="text-xs text-gray-400 truncate">{event.location}</p>}
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-xs text-white ${dotColor} px-2 py-0.5 rounded-full`}>{event.source}</span>
                  {event.isFree
                    ? <span className="text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full">Free</span>
                    : event.fee ? <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">${event.fee}</span> : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
