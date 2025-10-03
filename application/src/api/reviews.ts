export type Review = {
  id: string;
  appId: string;
  author: string;
  title: string;
  content: string;
  rating: number;
  date: string;
};

export type AppReviews = {
  id: string;
  name: string;
  reviews: Review[];
};

export type AppReviewsResponse = {
  data: AppReviews;
};

export async function getAppReviews(
  id: string,
  hours: number = 48
): Promise<AppReviews> {
  const response = await fetch(`/api/v1/apps/${id}/reviews?hours=${hours}`);

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: 'Unknown error' }));

    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  const { data }: AppReviewsResponse = await response.json();

  return data;
}
