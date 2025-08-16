/**
 * User model for MongoDB
 * 
 * Fields:
 * - firebaseUid: Firebase user ID (unique)
 * - name: User's full name
 * - blood_group: Blood group
 * - phone_number: Phone number
 * - email: Email address (unique)
 * - university_reg_no: University registration number
 * - role: 'admin' or 'user'
 * - createdAt: Timestamp of creation
 * - updatedAt: Timestamp of last update
 */

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    blood_group: {
      type: String,
      required: false,
    },
    phone_number: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    university_reg_no: {
      type: String,
      required: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('User', userSchema);