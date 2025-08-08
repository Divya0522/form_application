const User = require('../models/User');
const Form = require('../models/Form');
const ErrorHandler = require('../utils/errorHandler');

// Update getDashboardData to include template count
exports.getDashboardData = async (req, res, next) => {
  try {
    const userCount = await User.countDocuments();
    const formCount = await Form.countDocuments();
    const publishedForms = await Form.countDocuments({ isPublished: true });
    const templateCount = await Form.countDocuments({ isTemplate: true });

    res.status(200).json({
      success: true,
      data: {
        userCount,
        formCount,
        publishedForms,
        templateCount
      }
    });
  } catch (error) {
    next(error);
  }
};
// Add other admin dashboard functions as needed