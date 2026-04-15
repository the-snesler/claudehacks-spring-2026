import type { MscrData, UWEvent, IsthmusPage } from './sources';
import type { Event } from './event';
import { adaptMscrEvent } from './mscrAdapter';
import { adaptUWEvents } from './uwAdapter';
import { adaptIsthmusPages } from './isthmusAdapter';

import mscrData from '../../public/data/mscr_events.json';
import uwData from '../../public/data/uwmadison.json';
import isthmusPage1 from '../../public/data/isthmus/page_1.json';
import isthmusPage2 from '../../public/data/isthmus/page_2.json';
import isthmusPage3 from '../../public/data/isthmus/page_3.json';
import isthmusPage4 from '../../public/data/isthmus/page_4.json';
import isthmusPage5 from '../../public/data/isthmus/page_5.json';
import isthmusPage6 from '../../public/data/isthmus/page_6.json';
import isthmusPage7 from '../../public/data/isthmus/page_7.json';
import isthmusPage8 from '../../public/data/isthmus/page_8.json';
import isthmusPage9 from '../../public/data/isthmus/page_9.json';
import isthmusPage10 from '../../public/data/isthmus/page_10.json';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function loadAllEvents(): Event[] {
  const mscr = (mscrData as MscrData).events.map(adaptMscrEvent);
  const uw = adaptUWEvents(uwData as unknown as UWEvent[]);
  const isthmus = adaptIsthmusPages([
    isthmusPage1, isthmusPage2, isthmusPage3, isthmusPage4, isthmusPage5,
    isthmusPage6, isthmusPage7, isthmusPage8, isthmusPage9, isthmusPage10,
  ] as IsthmusPage[]);

  return shuffle([...mscr, ...uw, ...isthmus]);
}
