import mongoose from 'mongoose';
import { DB_NAME } from '../utils/constants.js';

const connectDB = async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}?appName=Cluster0`);
        console.log(`\nMongoDB connected!!`);
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

export default connectDB;
