/**
 * Seed script to create an admin user
 * 
 * Environment Variables:
 * - ADMIN_EMAIL: Admin email to seed
 * - MONGO_URI: MongoDB connection string
 * - FIREBASE_PROJECT_ID: Firebase project ID
 * - FIREBASE_CLIENT_EMAIL: Firebase service account email
 * - FIREBASE_PRIVATE_KEY: Firebase service account private key
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import admin from 'firebase-admin';
import User from '../src/models/User.js';

// Load environment variables
dotenv.config();

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}

const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      console.error('ADMIN_EMAIL environment variable is required');
      process.exit(1);
    }

    // Check if admin user already exists
    let adminUser = await User.findOne({ email: adminEmail });
    if (adminUser) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Get Firebase user by email
    const firebaseUser = await admin.auth().getUserByEmail(adminEmail);
    
    // Create admin user in MongoDB
    adminUser = new User({
      firebaseUid: firebaseUser.uid,
      email: firebaseUser.email,
      name: firebaseUser.displayName || 'Admin User',
      role: 'admin',
    });

    await adminUser.save();
    console.log('Admin user created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();