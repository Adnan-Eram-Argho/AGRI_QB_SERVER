/**
 * Authentication middleware to verify Firebase token and attach user to request
 * 
 * Environment Variables:
 * - None
 */

import { verifyToken } from '../config/firebaseAdmin.js';
import User from '../models/User.js';

/**
 * Middleware to authenticate user via Firebase token and attach user to request
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token required' });
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = await verifyToken(token);

    // Find user in database by Firebase UID
    let user = await User.findOne({ firebaseUid: decodedToken.uid });
    
    // If user doesn't exist, create a new user record
    if (!user) {
      user = new User({
        firebaseUid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name || '',
        role: 'user', // Default role
      });
      await user.save();
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};