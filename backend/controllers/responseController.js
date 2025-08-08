const Response = require('../models/Response');
const Form = require('../models/Form');
const ErrorHandler = require('../utils/errorHandler');

exports.submitResponse = async (req, res, next) => {
  try {
    const { formId } = req.params;
    const { responses } = req.body;

    // Validate form exists and is published
    const form = await Form.findById(formId);
    if (!form || (!form.isPublished && !form.isTemplate)) {
      return next(new ErrorHandler('Form not found or not published', 404));
    }

    // Create response
    const response = new Response({
      form: formId,
      responses: responses
    });

    await response.save();

    res.status(201).json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Response submission error:', error);
    next(new ErrorHandler('Internal server error', 500));
  }
};
exports.getFormResponses = async (req, res, next) => {
  try {
    const { formId } = req.params;
    
    // Verify the user owns the form
    const form = await Form.findOne({
      _id: formId,
      createdBy: req.user.id
    });
    
    if (!form) {
      return next(new ErrorHandler('Not authorized or form not found', 404));
    }

    // Get responses with submittedBy user info if available
    const responses = await Response.find({ form: formId })
      .sort({ createdAt: -1 }) // Newest first
      .populate('submittedBy', 'fullName email');

    res.status(200).json({
      success: true,
      count: responses.length,
      formFields: form.fields, // Include form fields in response
      data: responses
    });
  } catch (error) {
    next(error);
  }
};

// Add this new controller method
exports.getResponseCount = async (req, res, next) => {
  try {
    const formId = req.params.formId || req.params.id;
    
    const form = await Form.findOne({
      _id: formId,
      createdBy: req.user.id
    });
    
    if (!form) {
      return next(new ErrorHandler('Not authorized or form not found', 404));
    }

    const count = await Response.countDocuments({ form: formId });

    res.status(200).json({
      success: true,
      count
    });
  } catch (error) {
    next(error);
  }
};

exports.getResponseCounts = async (req, res, next) => {
  try {
    const formId = req.params.id;
    const count = await Response.countDocuments({ form: formId });
    
    res.status(200).json({
      success: true,
      count
    });
  } catch (error) {
    next(error);
  }
};

