const User = require('../models/User');
const Form = require('../models/Form');
const ErrorHandler = require('../utils/errorHandler');

exports.getDashboardData = async (req, res, next) => {
  try {
    // Get counts for dashboard
    const userCount = await User.countDocuments();
    const formCount = await Form.countDocuments();
    const publishedForms = await Form.countDocuments({ isPublished: true });

    res.status(200).json({
      success: true,
      data: {
        userCount,
        formCount,
        publishedForms
      }
    });
  } catch (error) {
    next(error);
  }
};

// Add other admin dashboard functions as needed