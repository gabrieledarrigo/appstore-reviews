import { useEffect, useState } from 'react';
import { getAppReviews, type AppReviews } from './api/reviews';
import { Reviews } from './components/Reviews';

const APP_ID = '595068606';
const HOURS = 1000;

function App() {
  const [appReviews, setAppReviews] = useState<AppReviews | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppReviews = async () => {
      try {
        const data = await getAppReviews(APP_ID, HOURS);
        setAppReviews(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAppReviews();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!appReviews) {
    return <div>No data available</div>;
  }

  return (
    <section>
      <header className="app-header">
        <h1>AppStore Reviews</h1>
        <p>
          Recent iOS App store reviews for <strong>{appReviews.name}</strong>
        </p>
      </header>

      <div className="reviews">
        <Reviews reviews={appReviews.reviews} />
      </div>
    </section>
  );
}

export default App;
