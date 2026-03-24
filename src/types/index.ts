export interface Store {
  id: string;
  name: string;
  address: string;
  phone: string;
  hours: string;
  description: string;
  images: string[];
  lat: number;
  lng: number;
  region: string;
  tags: string[];
  isRecommended?: boolean;
}

export interface Event {
  id: string;
  storeId: string;
  storeName: string;
  title: string;
  date: string;
  time: string;
  description: string;
  prize?: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  date: string;
}
