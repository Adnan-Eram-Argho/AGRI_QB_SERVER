/**
 * CSV import/export helper functions
 * 
 * Environment Variables:
 * - None
 */

import Papa from 'papaparse';

/**
 * Parse CSV string to array of objects
 * @param {string} csvString - CSV string to parse
 * @returns {Array} Parsed data
 */
export const parseCSV = (csvString) => {
  const results = Papa.parse(csvString, {
    header: true,
    skipEmptyLines: true,
  });
  return results.data;
};

/**
 * Format questions array to CSV string
 * @param {Array} questions - Array of question objects
 * @returns {string} CSV string
 */
export const formatCSV = (questions) => {
  // Flatten question objects for CSV
  const flattened = questions.map(q => ({
    id: q._id,
    title: q.title,
    body: q.body,
    course_name: q.course_id.name,
    course_code: q.course_id.code,
    year: q.year,
    exam_type: q.exam_type,
    question_type: q.question_type,
    difficulty: q.difficulty,
    tags: q.tags.join(';'),
    uploaded_by: q.uploadedBy.name,
    approved: q.approved,
    created_at: q.createdAt,
  }));

  return Papa.unparse(flattened);
};

/**
 * Format questions array to JSON
 * @param {Array} questions - Array of question objects
 * @returns {string} JSON string
 */
export const formatJSON = (questions) => {
  return JSON.stringify(questions, null, 2);
};