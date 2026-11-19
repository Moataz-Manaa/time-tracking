import 'dotenv/config';
import mongoose from 'mongoose';
import { setServers } from 'node:dns';

export async function connectDatabase() {
  if (process.env.DNS_SERVERS) setServers(process.env.DNS_SERVERS.split(',').map(value => value.trim()));
  if (!process.env.MONGODB_URI) throw new Error('Set MONGODB_URI in .env before starting the server.');
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  console.log('MongoDB connected');
}
