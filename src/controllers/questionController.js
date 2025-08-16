/**
 * Question controller functions
 * 
 * Environment Variables:
 * - None
 */

import Question from '../models/Question.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import { parseCSV, formatCSV, formatJSON } from '../utils/csvHelpers.js';

/**
 * Create a new question
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const createQuestion = async (req, res) => {
  try {
    const {
      title,
      body,
      course_id,
      year,
      exam_type,
      question_type,
      difficulty,
      images = [],
      attachments = [],
      tags = [],
    } = req.body;

    // Verify course exists
    const course = await Course.findById(course_id);
    if (!course) {
      return res.status(400).json({ message: 'Invalid course ID' });
    }

    const question = new Question({
      title,
      body,
      course_id,
      year,
      exam_type,
      question_type,
      difficulty,
      images,
      attachments,
      tags,
      uploadedBy: req.user._id,
      approved: false, // Default to not approved
    });

    const savedQuestion = await question.save();
    
    // Populate course and uploadedBy for response
    await savedQuestion.populate('course_id', 'name code');
    await savedQuestion.populate('uploadedBy', 'name email');

    res.status(201).json(savedQuestion);
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({ message: 'Failed to create question' });
  }
};

/**
 * Get questions with filtering, search, and pagination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getQuestions = async (req, res) => {
  try {
    const {
      course,
      year,
      exam_type,
      question_type,
      tags,
      q,
      page = 1,
      limit = 10,
    } = req.query;
    const skip = (page - 1) * limit;

    let query = { approved: true }; // Only show approved questions by default

    // If user is admin, show all questions (including unapproved)
    if (req.user && req.user.role === 'admin') {
      delete query.approved;
    }

    // Course filter (by name or code)
    if (course) {
      const courseDocs = await Course.find({
        $or: [
          { name: { $regex: course, $options: 'i' } },
          { code: { $regex: course, $options: 'i' } },
        ],
      });
      const courseIds = courseDocs.map(doc => doc._id);
      query.course_id = { $in: courseIds };
    }

    // Year filter
    if (year) {
      query.year = parseInt(year);
    }

    // Exam type filter
    if (exam_type) {
      query.exam_type = exam_type;
    }

    // Question type filter
    if (question_type) {
      query.question_type = question_type;
    }

    // Tags filter (comma separated)
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      query.tags = { $in: tagArray };
    }

    // Full-text search
    if (q) {
      query.$text = { $search: q };
    }

    const questions = await Question.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .populate('course_id', 'name code')
      .populate('uploadedBy', 'name email');

    const total = await Question.countDocuments(query);

    res.status(200).json({
      questions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ message: 'Failed to fetch questions' });
  }
};

/**
 * Get a question by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('course_id', 'name code')
      .populate('uploadedBy', 'name email');
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // If user is not admin and question is not approved, check if user is the owner
    if (req.user) {
      if (req.user.role !== 'admin' && !question.approved && question.uploadedBy._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
    } else {
      // If not authenticated, only allow approved questions
      if (!question.approved) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    res.status(200).json(question);
  } catch (error) {
    console.error('Error fetching question:', error);
    res.status(500).json({ message: 'Failed to fetch question' });
  }
};

/**
 * Update a question (owner or admin)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const updateQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Check if user is owner or admin
    if (req.user.role !== 'admin' && question.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // If question is approved and user is not admin, prevent updates
    if (question.approved && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Cannot update approved question' });
    }

    const {
      title,
      body,
      course_id,
      year,
      exam_type,
      question_type,
      difficulty,
      images,
      attachments,
      tags,
    } = req.body;

    // Verify course exists if provided
    if (course_id) {
      const course = await Course.findById(course_id);
      if (!course) {
        return res.status(400).json({ message: 'Invalid course ID' });
      }
    }

    const updatedQuestion = await Question.findByIdAndUpdate(
      req.params.id,
      {
        title,
        body,
        course_id,
        year,
        exam_type,
        question_type,
        difficulty,
        images,
        attachments,
        tags,
      },
      { new: true, runValidators: true }
    )
      .populate('course_id', 'name code')
      .populate('uploadedBy', 'name email');

    res.status(200).json(updatedQuestion);
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ message: 'Failed to update question' });
  }
};

/**
 * Delete a question (owner or admin)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Check if user is owner or admin
    if (req.user.role !== 'admin' && question.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // If question is approved and user is not admin, prevent deletion
    if (question.approved && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Cannot delete approved question' });
    }

    await Question.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ message: 'Failed to delete question' });
  }
};

/**
 * Approve a question (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const approveQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(
      req.params.id,
      { approved: true },
      { new: true }
    )
      .populate('course_id', 'name code')
      .populate('uploadedBy', 'name email');

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.status(200).json(question);
  } catch (error) {
    console.error('Error approving question:', error);
    res.status(500).json({ message: 'Failed to approve question' });
  }
};

/**
 * Bulk import questions (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const bulkImportQuestions = async (req, res) => {
  try {
    // This is a placeholder for bulk import functionality
    // In a real implementation, you would parse the uploaded CSV file
    // and create multiple questions
    
    res.status(501).json({ message: 'Bulk import not implemented yet' });
  } catch (error) {
    console.error('Error in bulk import:', error);
    res.status(500).json({ message: 'Failed to import questions' });
  }
};

/**
 * Export questions (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const exportQuestions = async (req, res) => {
  try {
    const { course, year, format = 'csv' } = req.query;
    
    let query = {};
    
    // Course filter (by name or code)
    if (course) {
      const courseDocs = await Course.find({
        $or: [
          { name: { $regex: course, $options: 'i' } },
          { code: { $regex: course, $options: 'i' } },
        ],
      });
      const courseIds = courseDocs.map(doc => doc._id);
      query.course_id = { $in: courseIds };
    }

    // Year filter
    if (year) {
      query.year = parseInt(year);
    }

    const questions = await Question.find(query)
      .populate('course_id', 'name code')
      .populate('uploadedBy', 'name email');

    if (format === 'csv') {
      const csv = formatCSV(questions);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=questions.csv');
      return res.status(200).send(csv);
    } else {
      const json = formatJSON(questions);
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=questions.json');
      return res.status(200).json(json);
    }
  } catch (error) {
    console.error('Error exporting questions:', error);
    res.status(500).json({ message: 'Failed to export questions' });
  }
};

/**
 * Get duplicate questions (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getDuplicateQuestions = async (req, res) => {
  try {
    // This is a placeholder for duplicate detection
    // In a real implementation, you would use a more sophisticated algorithm
    
    res.status(501).json({ message: 'Duplicate detection not implemented yet' });
  } catch (error) {
    console.error('Error detecting duplicates:', error);
    res.status(500).json({ message: 'Failed to detect duplicates' });
  }
};