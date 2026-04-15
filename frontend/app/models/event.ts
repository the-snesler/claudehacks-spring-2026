export type Event = {
  id: string;
  title: string;
  description: string;
  date: string;
  time?: string;
  location?: string;
  category?: string;
  tags: string[];
  isFree: boolean;
  fee?: number;
  imageUrl?: string;
  source: 'MSCR' | 'UW Madison' | 'Isthmus';
};

export type SwipeDirection = 'save' | 'pass';
