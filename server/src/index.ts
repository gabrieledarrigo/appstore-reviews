import express from 'express';

const app = express();
const port = 3001;

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.get('/', (req, res) => {
  res.json({ message: 'Server is running' });
});

app.get('/reviews', (req, res) => {
  res.json({ message: 'Reviews endpoint', data: [] });
});

app.listen(port, 'localhost', () => {
  console.log(`Server running on http://localhost:${port}`);
});
