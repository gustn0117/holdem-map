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
  is_hot?: boolean;
  pinned_rank?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Event {
  id: string;
  store_id: string | null;
  store_name: string;
  title: string;
  date: string;
  end_date?: string;
  time: string;
  description: string;
  prize?: string;
  image?: string;
  content_images?: string[];
  details?: string;
  buy_in?: string;
  location?: string;
  status?: string;
  submitted_by?: string | null;
  submitter_nickname?: string;
  is_international?: boolean;
  /** 무료토너먼트 신청 페이지(/tournament)에 노출할지 여부 */
  is_free_tournament?: boolean;
  pinned_rank?: number;
  created_at?: string;
}

export interface Job {
  id: string;
  type: string;
  nickname: string;
  role: string;
  experience: string;
  areas: string[];
  contact_type: string;
  contact: string;
  photo?: string;
  message?: string;
  store_name?: string;
  salary?: string;
  work_hours?: string;
  headcount?: string;
  gender?: string;
  user_id?: string;
  pinned_rank?: number;
  created_at?: string;
}

export interface Short {
  id: string;
  title: string;
  video_url: string;
  thumbnail: string;
  description: string;
  sort_order: number;
  active: boolean;
  pinned_rank?: number;
  created_at?: string;
}

export interface BannerLink {
  label: string;
  url: string;
}

export interface Banner {
  id: string;
  position: string;
  image: string;
  image_mobile?: string;
  link: string;
  active: boolean;
  pinned_rank?: number;
  updated_at?: string;
  links?: BannerLink[];
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  date: string;
  image?: string;
  pinned_rank?: number;
  created_at?: string;
}

export interface PointshopProduct {
  id: string;
  name: string;
  description?: string | null;
  image?: string | null;
  images?: string[] | null;
  price: number; // 포인트 가격
  stock: number; // 재고 (-1이면 무제한)
  category?: string | null;
  active: boolean;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
}

export type PointshopOrderStatus = "pending" | "approved" | "shipped" | "completed" | "cancelled";

export interface PointshopOrder {
  id: string;
  user_id: string;
  user_nickname?: string | null;
  product_id: string;
  product_name: string;
  product_image?: string | null;
  price: number;
  quantity: number;
  total_price: number;
  status: PointshopOrderStatus;
  recipient_name?: string | null;
  recipient_phone?: string | null;
  recipient_address?: string | null;
  memo?: string | null;
  admin_memo?: string | null;
  tracking_number?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt?: string | null;
  cover_image?: string | null;
  tags?: string[] | null;
  category?: string | null;
  author_nickname?: string | null;
  author_id?: string | null;
  published: boolean;
  views?: number;
  created_at?: string;
  updated_at?: string;
}
