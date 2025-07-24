const Response = require('../models/Response');
const Form = require('../models/Form');
const ErrorHandler = require('../utils/errorHandler');

exports.submitResponse = async (req, res, next) => {
  try {
    const { formId } = req.params;
    const { responses } = req.body;

    // Validate form exists and is published
    const form = await Form.findOne({
      _id: formId,
      isPublished: true
    });
    
    if (!form) {
      return res.status(404).json({
        success: false,
        error: 'Form not found or not published'
      });
    }

    // Create and save response
    const responseDoc = await Response.create({
      form: formId,
      responses,
      submittedBy: req.user?.id, // Will be null for public submissions
      createdAt: new Date()
    });

    res.status(201).json({
      success: true,
      data: responseDoc
    });
    
  } catch (error) {
    next(error);
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

