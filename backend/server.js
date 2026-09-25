import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import analyzerRoutes from './routes/analyzer.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Mount the stateless analyzer route (replacing the old MongoDB routes)
app.use('/api/analyzer', analyzerRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Analyzer Backend running on port ${PORT}`));