const Form = require('../models/Form');
const ErrorHandler = require('../utils/errorHandler');


exports.createTemplate = async (req, res, next) => {
    try {
        const { title, description, fields, templateCategory, templateImage } = req.body;
        
        const form = await Form.create({
            title,
            description,
            createdBy: req.user.id,
            fields: fields || [], // Can be empty initially
            isTemplate: true,
            templateCategory,
            templateImage,
            isPublished: true // Templates are always published
        });

        res.status(201).json({
            success: true,
            data: form
        });
    } catch (error) {
        next(error);
    }
};

exports.getTemplates = async (req, res, next) => {
    try {
        // Get all templates (no need to filter by user)
        const templates = await Form.find({ isTemplate: true });
        
        res.status(200).json({
            success: true,
            count: templates.length,
            data: templates
        });
    } catch (error) {
        next(error);
    }
};

exports.createFormFromTemplate = async (req, res, next) => {
    try {
        const { templateId } = req.params;
        
        // Find the template
        const template = await Form.findById(templateId);
        if (!template || !template.isTemplate) {
            return next(new ErrorHandler('Template not found', 404));
        }
        
        // Create a new form based on the template
        const form = await Form.create({
            title: `Copy of ${template.title}`,
            description: template.description,
            createdBy: req.user.id,
            fields: template.fields,
            isPublished: false,
            createdFromTemplate: templateId
        });
        
        res.status(201).json({
            success: true,
            data: form
        });
    } catch (error) {
        next(error);
    }
};


exports.deleteTemplate = async (req, res, next) => {
  try {
    const template = await Form.findOneAndDelete({
      _id: req.params.id,
      isTemplate: true,
      createdBy: req.user.id
    });

    if (!template) {
      return next(new ErrorHandler('Template not found', 404));
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};