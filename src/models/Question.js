/**
 * Question model for MongoDB
 * 
 * Fields:
 * - title: Short title of the question
 * - body: Full question text
 * - course_id: Reference to Course
 * - year: Exam year
 * - exam_type: Type of exam (midterm, final, viva, etc.)
 * - question_type: Type of question (MCQ, short, long, problem)
 * - difficulty: Difficulty level (easy, medium, hard)
 * - images: Array of image URLs (stored in ImageKit)
 * - attachments: Array of attachment URLs (PDFs, etc.)
 * - tags: Array of tags
 * - uploadedBy: Reference to User who uploaded
 * - approved: Boolean indicating if approved by admin
 * - createdAt: Timestamp of creation
 * - updatedAt: Timestamp of last update
 */

import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    course_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    exam_type: {
      type: String,
      enum: ['midterm', 'final', 'viva', 'assignment', 'quiz'],
      required: true,
    },
    question_type: {
      type: String,
      enum: ['MCQ', 'short', 'long', 'problem'],
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
    },
    images: [
      {
        type: String,
      },
    ],
    attachments: [
      {
        type: String,
      },
    ],
    tags: [
      {
        type: String,
      },
    ],
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    approved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create text index for full-text search on title and body
questionSchema.index({ title: 'text', body: 'text' });

export default mongoose.model('Question', questionSchema);