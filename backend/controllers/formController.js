const Form = require('../models/Form');
const ErrorHandler = require('../utils/errorHandler');


exports.getUserForms = async (req, res, next) => {
  try {

    const forms = await Form.find({ createdBy: req.user.id }).select('-fields');
    res.status(200).json({
      success: true,
      count: forms.length,
      data: forms
    });
  } catch (error) {
    next(error);
  }
};


exports.createForm = async (req, res, next) => {
  try {
    const { title, description, fields } = req.body;
    
    const form = await Form.create({
      title,
      description,
      createdBy: req.user.id,
      fields
    });

    res.status(201).json({
      success: true,
      data: form
    });
  } catch (error) {
    next(error);
  }
};

exports.getForm = async (req, res, next) => {
  try {
    const form = await Form.findOne({
      _id: req.params.id,
      createdBy: req.user.id
    });

    if (!form) {
      return next(new ErrorHandler('Form not found', 404));
    }

    res.status(200).json({
      success: true,
      data: form
    });
  } catch (error) {
    next(error);
  }
};

exports.updateForm = async (req, res, next) => {
  try {
    const { title, description, fields } = req.body;
    
    const form = await Form.findOneAndUpdate(
      { 
        _id: req.params.id,
        createdBy: req.user.id
      },
      { title, description, fields },
      { new: true, runValidators: true }
    );

    if (!form) {
      return next(new ErrorHandler('Form not found', 404));
    }

    res.status(200).json({
      success: true,
      data: form
    });
  } catch (error) {
    next(error);
  }
};


exports.deleteForm = async (req, res, next) => {
  try {
    const form = await Form.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.id
    });

    if (!form) {
      return next(new ErrorHandler('Form not found', 404));
    }

   
    await Response.deleteMany({ form: req.params.id });

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

exports.publishForm = async (req, res, next) => {
  try {
    const form = await Form.findOneAndUpdate(
      { 
        _id: req.params.id,
        createdBy: req.user.id
      },
      { 
        isPublished: true,
        publishedAt: Date.now()
      },
      { new: true }
    );

    if (!form) {
      return next(new ErrorHandler('Form not found', 404));
    }

    res.status(200).json({
      success: true,
      data: form
    });
  } catch (error) {
    next(error);
  }
};

exports.unpublishForm = async (req, res, next) => {
  try {
    const form = await Form.findOneAndUpdate(
      { 
        _id: req.params.id,
        createdBy: req.user.id
      },
      { 
        isPublished: false,
        publishedAt: null
      },
      { new: true }
    );

    if (!form) {
      return next(new ErrorHandler('Form not found', 404));
    }

    res.status(200).json({
      success: true,
      data: form
    });
  } catch (error) {
    next(error);
  }
};


exports.getPublicForm = async (req, res, next) => {
    try {
        const form = await Form.findOne({
            _id: req.params.id,
            isPublished: true
        }).select('-createdBy');

        if (!form) {
            return next(new ErrorHandler('Form not found or not published', 404));
        }

        res.status(200).json({
            success: true,
            data: form
        });
    } catch (error) {
        next(error);
    }
};