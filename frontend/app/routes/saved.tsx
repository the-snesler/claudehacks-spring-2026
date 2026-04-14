import { useState, useEffect } from "react";
import eventsData from "../../data/mscr_events.json";

export default function Saved() {
  const [savedIds, setSavedIds] = useState<number[]>([]);

  useEffect(() => {
    try {
      setSavedIds(JSON.parse(localStorage.getItem("saved_events") || "[]"));
    } catch {
      setSavedIds([]);
    }
  }, []);

  const saved = eventsData.events.filter((e) => savedIds.includes(e.id));

  function remove(id: number) {
    const next = savedIds.filter((s) => s !== id);
    setSavedIds(next);
    localStorage.setItem("saved_events", JSON.stringify(next));
  }

  if (saved.length === 0) {
    return (
      <div className="flex items-center justify-center h-[70vh] text-gray-400">
        <p>No saved events yet — go swipe some!</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-4 space-y-3">
      <h1 className="text-xl font-bold text-gray-800 mb-4">Saved Events</h1>
      {saved.map((event) => (
        <div key={event.id} className="border border-gray-200 rounded-2xl p-4 bg-white shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold uppercase tracking-wide text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              {event.category}
            </span>
            <button onClick={() => remove(event.id)} className="text-gray-300 hover:text-red-400 text-lg leading-none">
              ✕
            </button>
          </div>
          <h2 className="mt-2 font-bold text-gray-900">{event.title}</h2>
          <div className="mt-2 space-y-0.5 text-sm text-gray-500">
            <p>📍 {event.location}</p>
            <p>📅 {event.startDate}{event.endDate !== event.startDate ? ` – ${event.endDate}` : ""}</p>
            <p>🕐 {event.time}</p>
            <p className="font-semibold text-gray-700">{event.isFree ? "Free" : `$${event.fee}`}</p>
          </div>
          <a
            href={event.registrationUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-block text-xs text-indigo-600 hover:underline"
          >
            Register →
          </a>
        </div>
      ))}
    </div>
  );
}
