/**
 * Role-based access control middleware
 * 
 * Environment Variables:
 * - None
 */

/**
 * Middleware to restrict access to admin users only
 */
export const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
  next();
};