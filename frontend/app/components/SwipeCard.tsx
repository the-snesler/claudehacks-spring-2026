import { motion, useMotionValue, useTransform, animate, type PanInfo } from 'framer-motion';
import type { Event, SwipeDirection } from '../models/event';

const SWIPE_THRESHOLD = 100;
const VELOCITY_THRESHOLD = 500;
const MAX_OVERLAY_OPACITY = 0.55;
const EXIT_TRAVEL = 160;

const FALLBACK_IMAGES = ['/images/campus.jpg', '/images/bascom.jpg', '/images/capitol.jpg'];

const SOURCE_COLORS: Record<string, string> = {
  MSCR: 'bg-blue-500',
  'UW Madison': 'bg-red-600',
  Isthmus: 'bg-emerald-600',
};

type SwipeCardProps = {
  event: Event;
  onSwipe: (direction: SwipeDirection) => void;
  style?: React.CSSProperties;
};

export default function SwipeCard({ event, onSwipe, style }: SwipeCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const opacity = useMotionValue(1);
  const rotate = useTransform(x, [-300, 300], [-20, 20]);

  const saveOverlayOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, MAX_OVERLAY_OPACITY]);
  const passOverlayOpacity = useTransform(x, [-SWIPE_THRESHOLD, 0], [MAX_OVERLAY_OPACITY, 0]);
  const saveSymbolOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1]);
  const passSymbolOpacity = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0]);

  function exitCard(direction: SwipeDirection) {
    const sign = direction === 'save' ? 1 : -1;
    const targetX = x.get() + sign * EXIT_TRAVEL;
    animate(opacity, 0, { duration: 0.2, ease: 'easeOut' }).then(() => onSwipe(direction));
    animate(x, targetX, { duration: 0.2, ease: 'easeOut' });
  }

  function handleDragEnd(_: unknown, info: PanInfo) {
    const currentX = x.get();
    const vx = info.velocity.x;
    const pastThreshold = Math.abs(currentX) > SWIPE_THRESHOLD;
    const fastFlick = Math.abs(vx) > VELOCITY_THRESHOLD;

    if (pastThreshold || fastFlick) {
      const direction: SwipeDirection =
        fastFlick ? (vx > 0 ? 'save' : 'pass') : (currentX > 0 ? 'save' : 'pass');
      exitCard(direction);
    } else {
      animate(x, 0, { type: 'spring', stiffness: 300, damping: 30, velocity: vx });
      animate(y, 0, { type: 'spring', stiffness: 300, damping: 30, velocity: info.velocity.y });
    }
  }

  const sourceBadgeColor = SOURCE_COLORS[event.source] ?? 'bg-gray-500';
  const fallbackImage = FALLBACK_IMAGES[event.title.length % 3];

  return (
    <motion.div
      className="absolute select-none w-80 h-[34rem]"
      style={style}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <motion.div
        className="absolute inset-0 rounded-3xl shadow-xl flex flex-col overflow-hidden cursor-grab active:cursor-grabbing bg-white"
        style={{ x, y, rotate, opacity }}
        drag="x"
        dragMomentum={false}
        dragElastic={0.15}
        onDragEnd={handleDragEnd}
      >
        {/* Header image / color block */}
        <div className="flex-shrink-0 h-44 bg-gray-100 relative flex items-center justify-center">
          <img
            src={event.imageUrl || fallbackImage}
            alt={event.title}
            className="w-full h-full object-cover pointer-events-none"
            draggable={false}
          />

          {/* Source badge */}
          <span className={`absolute top-3 right-3 ${sourceBadgeColor} text-white text-xs font-semibold px-2 py-0.5 rounded-full`}>
            {event.source}
          </span>

          {/* Save overlay */}
          <motion.div
            className="absolute inset-0 bg-green-500 flex items-center justify-center pointer-events-none"
            style={{ opacity: saveOverlayOpacity }}
          >
            <motion.svg viewBox="0 0 24 24" className="w-20 h-20 text-white drop-shadow" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={{ opacity: saveSymbolOpacity }}>
              <path d="M5 13l4 4L19 7" />
            </motion.svg>
          </motion.div>

          {/* Pass overlay */}
          <motion.div
            className="absolute inset-0 bg-red-500 flex items-center justify-center pointer-events-none"
            style={{ opacity: passOverlayOpacity }}
          >
            <motion.svg viewBox="0 0 24 24" className="w-20 h-20 text-white drop-shadow" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={{ opacity: passSymbolOpacity }}>
              <path d="M6 18L18 6M6 6l12 12" />
            </motion.svg>
          </motion.div>
        </div>

        {/* Event info */}
        <div className="flex-1 px-5 pt-4 pb-3 flex flex-col gap-1 overflow-hidden">
          {event.category && (
            <span className="text-xs font-semibold uppercase tracking-wide text-indigo-600">{event.category}</span>
          )}
          <h2 className="font-bold text-gray-900 text-lg leading-snug line-clamp-2">{event.title}</h2>

          <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-0.5">
            <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
            <span className="truncate">{event.date}{event.time ? ` · ${event.time}` : ''}</span>
          </div>

          {event.location && (
            <div className="flex items-start gap-1.5 text-sm text-gray-500">
              <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
              <span className="line-clamp-2">{event.location}</span>
            </div>
          )}

          <p className="text-sm text-gray-600 line-clamp-3 mt-1">{event.description}</p>
        </div>

        {/* Fee badge */}
        <div className="px-5 pb-4">
          {event.isFree ? (
            <span className="text-xs font-semibold text-green-700 bg-green-100 px-2.5 py-1 rounded-full">Free</span>
          ) : event.fee ? (
            <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-full">${event.fee}</span>
          ) : null}
        </div>
      </motion.div>
    </motion.div>
  );
}
