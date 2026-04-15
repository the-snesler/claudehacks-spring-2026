import { useState, useRef } from "react";
import eventsData from "../../data/mscr_events.json";

type Event = (typeof eventsData.events)[0];

function getSaved(): number[] {
  try {
    return JSON.parse(localStorage.getItem("saved_events") || "[]");
  } catch {
    return [];
  }
}

function setSaved(ids: number[]) {
  localStorage.setItem("saved_events", JSON.stringify(ids));
}

export default function Home() {
  const [index, setIndex] = useState(0);
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [flash, setFlash] = useState<"save" | "skip" | null>(null);
  const startX = useRef(0);
  const events = eventsData.events;
  const current = events[index];

  function save() {
    const saved = getSaved();
    if (current && !saved.includes(current.id)) {
      setSaved([...saved, current.id]);
    }
    setFlash("save");
    setOffset(0);
    setTimeout(() => { setFlash(null); setIndex((i) => i + 1); }, 350);
  }

  function skip() {
    setFlash("skip");
    setOffset(0);
    setTimeout(() => { setFlash(null); setIndex((i) => i + 1); }, 350);
  }

  function onPointerDown(e: React.PointerEvent) {
    startX.current = e.clientX;
    setDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging) return;
    setOffset(e.clientX - startX.current);
  }

  function onPointerUp() {
    if (offset > 80) save();
    else if (offset < -80) skip();
    else setOffset(0);
    setDragging(false);
  }

  if (!current) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-gray-500">
        <p className="text-2xl">You've seen all events!</p>
      </div>
    );
  }

  const rotation = offset / 15;
  const cardOpacity = Math.max(0, 1 - Math.abs(offset) / 300);

  return (
    <div className="flex flex-col items-center justify-center py-10 select-none">
      <div className="relative w-80">
        {/* Background card (stack effect) */}
        {events[index + 1] && (
          <div className="absolute inset-0 top-2 rounded-2xl border border-gray-200 bg-white scale-95 z-0" />
        )}

        {/* Main card */}
        <div
          className={`relative z-10 bg-white rounded-2xl p-6 shadow-lg cursor-grab active:cursor-grabbing border-4 transition-colors ${flash === "save" ? "border-green-500 bg-green-50" : flash === "skip" ? "border-red-500 bg-red-50" : "border-gray-200"}`}
          style={{
            transform: `translateX(${offset}px) rotate(${rotation}deg)`,
            transition: dragging ? "none" : "transform 0.3s ease",
            opacity: cardOpacity,
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        >
          {flash && (
            <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/70 z-20">
              <span
                className={`text-7xl ${flash === "save" ? "text-green-500" : "text-red-400"}`}
                style={{ animation: "flashOut 0.35s ease-out forwards" }}
              >
                {flash === "save" ? "✓" : "✕"}
              </span>
            </div>
          )}
          {offset > 30 && (
            <div className="absolute top-4 left-4 border-2 border-green-500 text-green-500 font-bold text-lg px-2 py-1 rounded rotate-[-15deg]">
              SAVE
            </div>
          )}
          {offset < -30 && (
            <div className="absolute top-4 right-4 border-2 border-red-400 text-red-400 font-bold text-lg px-2 py-1 rounded rotate-[15deg]">
              SKIP
            </div>
          )}

          <span className="text-xs font-semibold uppercase tracking-wide text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
            {current.category}
          </span>
          <h2 className="mt-3 text-xl font-bold text-gray-900">{current.title}</h2>
          <p className="mt-2 text-sm text-gray-500">{current.description}</p>
          <div className="mt-4 space-y-1 text-sm text-gray-600">
            <p>📍 {current.location}</p>
            <p>📅 {current.startDate}{current.endDate !== current.startDate ? ` – ${current.endDate}` : ""}</p>
            <p>🕐 {current.time}</p>
            <p>👤 Ages: {current.ageRange}</p>
            <p className="font-semibold">{current.isFree ? "Free" : `$${current.fee}`}</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-1">
            {current.tags.map((tag) => (
              <span key={tag} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-6 mt-8">
        <button
          onClick={skip}
          className={`w-14 h-14 rounded-full border-2 text-2xl flex items-center justify-center transition ${flash === "skip" ? "border-red-500 bg-red-500 text-white" : "border-red-300 text-red-400 hover:bg-red-50"}`}
        >
          ✕
        </button>
        <button
          onClick={save}
          className={`w-14 h-14 rounded-full border-2 text-2xl flex items-center justify-center transition ${flash === "save" ? "border-green-500 bg-green-500 text-white" : "border-green-400 text-green-500 hover:bg-green-50"}`}
        >
          ♥
        </button>
      </div>

      <p className="mt-4 text-xs text-gray-400">{index + 1} / {events.length}</p>
    </div>
  );
}
