/**
 * Course controller functions
 * 
 * Environment Variables:
 * - None
 */

import Course from '../models/Course.js';

/**
 * Create a new course
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const createCourse = async (req, res) => {
  try {
    const { name, code, description, tags } = req.body;

    // Check if course code already exists
    const existingCourse = await Course.findOne({ code });
    if (existingCourse) {
      return res.status(400).json({ message: 'Course code already exists' });
    }

    const course = new Course({
      name,
      code,
      description,
      tags: tags || [],
    });

    const savedCourse = await course.save();
    res.status(201).json(savedCourse);
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ message: 'Failed to create course' });
  }
};

/**
 * Get all courses with optional search and pagination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getCourses = async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (q) {
      // Case-insensitive search on name and code
      query = {
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { code: { $regex: q, $options: 'i' } },
        ],
      };
    }

    const courses = await Course.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ name: 1 });

    const total = await Course.countDocuments(query);

    res.status(200).json({
      courses,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ message: 'Failed to fetch courses' });
  }
};

/**
 * Get a course by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.status(200).json(course);
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ message: 'Failed to fetch course' });
  }
};

/**
 * Update a course
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const updateCourse = async (req, res) => {
  try {
    const { name, code, description, tags } = req.body;
    
    // Check if course code already exists (excluding current course)
    if (code) {
      const existingCourse = await Course.findOne({ 
        code, 
        _id: { $ne: req.params.id } 
      });
      if (existingCourse) {
        return res.status(400).json({ message: 'Course code already exists' });
      }
    }

    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { name, code, description, tags },
      { new: true, runValidators: true }
    );

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.status(200).json(course);
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ message: 'Failed to update course' });
  }
};

/**
 * Delete a course
 * @param {Object} req - Express request object
 * @param {Object} re - Express response object
 */
export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.status(200).json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ message: 'Failed to delete course' });
  }
};