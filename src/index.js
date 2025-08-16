/**
 * Server entry point
 * 
 * Environment Variables:
 * - PORT: Server port (default: 5000)
 * - MONGO_URI: MongoDB connection string
 * - FIREBASE_PROJECT_ID: Firebase project ID
 * - FIREBASE_CLIENT_EMAIL: Firebase service account email
 * - FIREBASE_PRIVATE_KEY: Firebase service account private key
 * - IMAGEKIT_PUBLIC_KEY: ImageKit public key
 * - IMAGEKIT_PRIVATE_KEY: ImageKit private key
 * - IMAGEKIT_URL_ENDPOINT: ImageKit URL endpoint
 * - ADMIN_EMAIL: Admin email for seeding
 * 
 * Run commands:
 * - Development: npm run dev
 * - Production: npm start
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Import routes
import courseRoutes from './routes/courseRoutes.js';
import questionRoutes from './routes/questionRoutes.js';
import authRoutes from './routes/authRoutes.js';

// Import database configuration
import connectDB from './config/db.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Routes
app.use('/api/courses', courseRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/auth', authRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});