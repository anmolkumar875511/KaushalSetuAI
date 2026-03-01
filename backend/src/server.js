import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './db/index.js';
import { createDefaultAdmin } from './utils/defaultAdmin.js';

dotenv.config();

const startServer = async () => {
    try {
        await connectDB();
        await createDefaultAdmin();

        console.log('✅ Database connected');

        if (!process.env.VERCEL) {
            const PORT = process.env.PORT || 5000;
            app.listen(PORT, () => {
                console.log(`Local server running on http://localhost:${PORT}`);
            });
        }
    } catch (error) {
        console.error('Server startup failed:', error);
        if (!process.env.VERCEL) process.exit(1);
    }
};

startServer();

export default app;
