
const User = require('../models/User');
const Form = require('../models/Form');
const Response = require('../models/Response');
const ErrorHandler = require('../utils/errorHandler');

exports.getDashboardData = async (req, res, next) => {
  try {
    const userCount = await User.countDocuments();
    const formCount = await Form.countDocuments();
    const publishedForms = await Form.countDocuments({ isPublished: true });
    const templateCount = await Form.countDocuments({ isTemplate: true });


    const recentForms = await Form.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title createdBy createdAt');
    const recentResponses = await Response.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate({ path: 'form', select: 'title' });

    const recentActivities = [
      ...recentForms.map(f => ({
        type: 'form',
        message: 'New form created:',
        entity: f.title,
        timestamp: f.createdAt,
      })),
   
      ...recentResponses.filter(r => r.form).map(r => ({
        type: 'response',
        message: 'New response for:',
        entity: r.form.title,
        timestamp: r.createdAt,
      }))
    ].sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);

    res.status(200).json({
      success: true,
      data: {
        userCount,
        formCount,
        publishedForms,
        templateCount,
        recentActivities,
      }
    });
  } catch (error) {
    next(error);
  }
};


exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

exports.getAllForms = async (req, res, next) => {
  try {
    const forms = await Form.find().populate('createdBy', 'fullName email').sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: forms });
  } catch (error) {
    next(error);
  }
};


exports.getAllResponses = async (req, res, next) => {
  try {
    const responses = await Response.find()
      .populate('form', 'title')
      .populate('submittedBy', 'fullName email')
      .sort({ createdAt: -1 });
    
    
    const filteredResponses = responses.filter(r => r.form);
    
    res.status(200).json({ success: true, data: filteredResponses });
  } catch (error) {
    next(error);
  }
};