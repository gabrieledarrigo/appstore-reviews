export interface Review {
  id: string;
  appId: string;
  author: string;
  title: string;
  content: string;
  rating: number;
  date: Date;
}

export interface ReviewsQuery {
  appId: string;
  hours?: number;
}
