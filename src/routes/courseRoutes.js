/**
 * Course routes
 * 
 * Environment Variables:
 * - None
 */

import express from 'express';
import { body, query } from 'express-validator';
import {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
} from '../controllers/courseController.js';
import { authenticate } from '../middleware/auth.js';
import { adminOnly } from '../middleware/role.js';

const router = express.Router();

// Create a new course (admin only)
router.post(
  '/',
  authenticate,
  adminOnly,
  [
    body('name').notEmpty().withMessage('Course name is required'),
    body('code').notEmpty().withMessage('Course code is required'),
  ],
  createCourse
);

// Get all courses with optional search and pagination
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('q').optional().isString().withMessage('Search query must be a string'),
  ],
  getCourses
);

// Get a course by ID
router.get('/:id', getCourseById);

// Update a course (admin only)
router.put(
  '/:id',
  authenticate,
  adminOnly,
  [
    body('name').optional().notEmpty().withMessage('Course name cannot be empty'),
    body('code').optional().notEmpty().withMessage('Course code cannot be empty'),
  ],
  updateCourse
);

// Delete a course (admin only)
router.delete('/:id', authenticate, adminOnly, deleteCourse);

export default router;