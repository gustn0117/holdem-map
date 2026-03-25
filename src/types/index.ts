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
  is_recommended?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Event {
  id: string;
  store_id: string;
  store_name: string;
  title: string;
  date: string;
  time: string;
  description: string;
  prize?: string;
  image?: string;
  details?: string;
  buy_in?: string;
  location?: string;
  created_at?: string;
}

export interface Job {
  id: string;
  nickname: string;
  role: string;
  experience: string;
  areas: string[];
  contact_type: string;
  contact: string;
  photo?: string;
  message?: string;
  created_at?: string;
}

export interface Banner {
  id: string;
  position: string;
  image: string;
  link: string;
  active: boolean;
  updated_at?: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  date: string;
  created_at?: string;
}
