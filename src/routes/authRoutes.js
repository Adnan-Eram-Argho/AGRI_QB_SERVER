/**
 * Authentication routes (minimal, since auth is handled by Firebase)
 * 
 * Environment Variables:
 * - None
 */

import express from 'express';
import { authenticate } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// Get current user profile
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-firebaseUid');
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Failed to fetch user profile' });
  }
});

// Update user profile
router.put('/me', authenticate, async (req, res) => {
  try {
    const { name, blood_group, phone_number, university_reg_no } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, blood_group, phone_number, university_reg_no },
      { new: true, runValidators: true }
    ).select('-firebaseUid');
    
    res.status(200).json(user);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Failed to update user profile' });
  }
});

export default router;