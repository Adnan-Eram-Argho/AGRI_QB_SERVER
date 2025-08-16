/**
 * Question routes
 * 
 * Environment Variables:
 * - None
 */

import express from 'express';
import { body, query } from 'express-validator';
import {
  createQuestion,
  getQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  approveQuestion,
  bulkImportQuestions,
  exportQuestions,
  getDuplicateQuestions,
} from '../controllers/questionController.js';
import { authenticate } from '../middleware/auth.js';
import { adminOnly } from '../middleware/role.js';

const router = express.Router();

// Create a new question (authenticated users)
router.post(
  '/',
  authenticate,
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('body').notEmpty().withMessage('Question body is required'),
    body('course_id').isMongoId().withMessage('Valid course ID is required'),
    body('year').isInt({ min: 1900, max: new Date().getFullYear() }).withMessage('Valid year is required'),
    body('exam_type').isIn(['midterm', 'final', 'viva', 'assignment', 'quiz']).withMessage('Invalid exam type'),
    body('question_type').isIn(['MCQ', 'short', 'long', 'problem']).withMessage('Invalid question type'),
    body('difficulty').isIn(['easy', 'medium', 'hard']).withMessage('Invalid difficulty level'),
  ],
  createQuestion
);

// Bulk import questions (admin only)
router.post(
  '/bulk-import',
  authenticate,
  adminOnly,
  bulkImportQuestions
);

// Get questions with filtering, search, and pagination
router.get(
  '/',
  [
    query('course').optional().isString().withMessage('Course must be a string'),
    query('year').optional().isInt({ min: 1900, max: new Date().getFullYear() }).withMessage('Valid year is required'),
    query('exam_type').optional().isIn(['midterm', 'final', 'viva', 'assignment', 'quiz']).withMessage('Invalid exam type'),
    query('question_type').optional().isIn(['MCQ', 'short', 'long', 'problem']).withMessage('Invalid question type'),
    query('tags').optional().isString().withMessage('Tags must be a string (comma separated)'),
    query('q').optional().isString().withMessage('Search query must be a string'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  ],
  getQuestions
);

// Get a question by ID
router.get('/:id', getQuestionById);

// Update a question (owner or admin)
router.put(
  '/:id',
  authenticate,
  [
    body('title').optional().notEmpty().withMessage('Title cannot be empty'),
    body('body').optional().notEmpty().withMessage('Question body cannot be empty'),
  ],
  updateQuestion
);

// Delete a question (owner or admin)
router.delete('/:id', authenticate, deleteQuestion);

// Approve a question (admin only)
router.post('/:id/approve', authenticate, adminOnly, approveQuestion);

// Export questions (admin only)
router.get(
  '/export',
  authenticate,
  adminOnly,
  [
    query('course').optional().isString().withMessage('Course must be a string'),
    query('year').optional().isInt({ min: 1900, max: new Date().getFullYear() }).withMessage('Valid year is required'),
    query('format').optional().isIn(['csv', 'json']).withMessage('Format must be csv or json'),
  ],
  exportQuestions
);

// Get duplicate questions (admin only)
router.get('/duplicates', authenticate, adminOnly, getDuplicateQuestions);

export default router;