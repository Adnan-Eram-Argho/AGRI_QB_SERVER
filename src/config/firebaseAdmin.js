/**
 * Firebase Admin initialization and token verification helper
 * 
 * Environment Variables:
 * - FIREBASE_PROJECT_ID: Firebase project ID
 * - FIREBASE_CLIENT_EMAIL: Firebase service account email
 * - FIREBASE_PRIVATE_KEY: Firebase service account private key
 */

import admin from 'firebase-admin';
import dotenv from 'dotenv';
dotenv.config();

// Check if Firebase app is already initialized to avoid multiple initializations
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}

/**
 * Verify Firebase ID token and return decoded token
 * @param {string} token - Firebase ID token
 * @returns {Promise<Object>} Decoded token
 */
export const verifyToken = async (token) => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

export default admin;