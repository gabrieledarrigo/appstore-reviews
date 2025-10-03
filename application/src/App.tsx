import { useEffect, useState } from 'react';
import { getReviews, type Review } from './api/reviews';
import { Reviews } from './components/Reviews';

const APP_ID = '595068606';
const HOURS = 1000;

function App() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await getReviews(APP_ID, HOURS);
        setReviews(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <section>
      <header className="app-header">
        <h1>AppStore Reviews</h1>
        <p>Recent iOS App store reviews</p>
      </header>

      <div className="reviews">
        <Reviews reviews={reviews} />
      </div>
    </section>
  );
}

export default App;
