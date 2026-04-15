export type MscrEvent = {
  id: number;
  title: string;
  category: string;
  description: string;
  location: string;
  address: string;
  startDate: string;
  endDate: string;
  time: string;
  ageRange: string;
  fee: number;
  isFree: boolean;
  tags: string[];
  source: string;
  registrationUrl: string;
};

export type MscrData = {
  events: MscrEvent[];
};

export type UWEvent = {
  id: string;
  date: string;
  title: string;
  subtitle: string;
  description: string;
  time: {
    start: string;
    end: string;
    allDay: boolean;
    dropIn: boolean;
  };
  locations: { name: string; link: string }[];
  link: string;
  type: string;
};

export type IsthmusJsonLd = {
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  location?: {
    name?: string;
    address?: string;
  };
  image?: string | null;
  url?: string;
};

export type IsthmusResult = {
  urlname: string;
  title: string;
  lng: string;
  lat: string;
  html: string;
};

export type IsthmusPage = {
  results: IsthmusResult[];
};
