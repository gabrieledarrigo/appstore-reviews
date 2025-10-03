export interface App {
  id: string;
  name: string;
}

export interface Review {
  id: string;
  appId: string;
  author: string;
  title: string;
  content: string;
  rating: number;
  date: string; // ISO 8601
}

export interface ReviewsQuery {
  id: string;
  hours?: number;
}
