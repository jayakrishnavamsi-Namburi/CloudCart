import User from '../models/User.js';

/**
 * @desc    Get all users (excluding passwords)
 * @route   GET /api/users
 * @access  Private/Admin
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a user's role (user / admin)
 * @route   PUT /api/users/:id
 * @access  Private/Admin
 */
export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Valid role is required ("user" or "admin")'
      });
    }

    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from removing their own admin status accidentally
    if (user._id.toString() === req.user._id.toString() && role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot demote your own admin account'
      });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user metrics (total count, new users this month)
 * @route   GET /api/users/stats
 * @access  Private/Admin
 */
export const getUserStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: startOfMonth }
    });

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        newUsersThisMonth
      }
    });
  } catch (error) {
    next(error);
  }
};
