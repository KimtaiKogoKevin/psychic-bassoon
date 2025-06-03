import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config(); // Load .env variables

const app = express();
const port = process.env.BACKEND_PORT || 3001;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000', // Adjust for prod
  credentials: true // If you plan to use cookies for auth
}));
app.use(express.json()); // Middleware to parse JSON bodies


app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to the B2B Headless API,I plan to build a shopify healdess API!');
});

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'UP', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`[server]: Backend server is running at http://localhost:${port}`);
});