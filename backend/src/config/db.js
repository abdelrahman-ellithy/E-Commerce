import mongoose from 'mongoose';
import { env } from './env.js';

mongoose.set('strictQuery', true);

export async function connectDB(uri = env.mongoUri) {
  try {
    const connection = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10_000,
      maxPoolSize: 10,
    });

    if (!env.isTest) {
      console.log(
        `MongoDB connected: ${connection.connection.host}/${connection.connection.name}`
      );
    }

    return connection;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    throw error;
  }
}

export async function disconnectDB() {
  await mongoose.connection.close();
}
