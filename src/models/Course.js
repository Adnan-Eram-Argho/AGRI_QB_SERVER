/**
 * Course model for MongoDB
 * 
 * Fields:
 * - name: Course name
 * - code: Course code (unique)
 * - description: Course description
 * - tags: Array of tags
 * - createdAt: Timestamp of creation
 * - updatedAt: Timestamp of last update
 */

import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: false,
    },
    tags: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Course', courseSchema);