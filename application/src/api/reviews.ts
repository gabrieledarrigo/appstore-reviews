export type Review = {
  id: string;
  appId: string;
  author: string;
  title: string;
  content: string;
  rating: number;
  date: string;
};

export type ReviewResponse = {
  data: Review[];
};

export async function getReviews(
  appId: string,
  hours: number = 48
): Promise<Review[]> {
  const response = await fetch(`/api/v1/reviews?appId=${appId}&hours=${hours}`);

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: 'Unknown error' }));

    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  const { data }: ReviewResponse = await response.json();

  return data;
}
