import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './db/index.js';
import { createDefaultAdmin } from './utils/defaultAdmin.js';

dotenv.config();

connectDB()
    .then(() => {
        console.log('Database connected');
        createDefaultAdmin();
    })
    .catch((err) => {
        console.error('Database connection failed:', err);
    });

if (!process.env.VERCEL) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Local server running on http://localhost:${PORT}`);
    });
}

export default app;
