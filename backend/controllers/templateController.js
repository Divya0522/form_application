const Form = require('../models/Form');
const ErrorHandler = require('../utils/errorHandler');

exports.createTemplate = async (req, res) => {
    try {
        const { title, description, fields, templateCategory, templateImage } = req.body;
        
        const template = await Form.create({
            title,
            description,
            createdBy: req.user.id,
            fields: fields || [],
            isTemplate: true,
            templateCategory,
            templateImage,
            isPublished: true
        });

        res.status(201).json({
            success: true,
            data: template
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
// Update createFormFromTemplate function
exports.createFormFromTemplate = async (req, res, next) => {
    try {
        const { templateId } = req.params;
        const template = await Form.findById(templateId);
        
        if (!template || !template.isTemplate) {
            return next(new ErrorHandler('Template not found', 404));
        }
        
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


exports.getTemplates = async (req, res, next) => {
    try {
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

// Add this to your existing templateController.js
exports.getTemplateCount = async (req, res, next) => {
  try {
    const count = await Form.countDocuments({ isTemplate: true });
    res.status(200).json({
      success: true,
      count
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllTemplates = async (req, res, next) => {
    try {
    const templates = await Form.find({ isTemplate: true });
    res.json({ data: templates });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }

};

exports.getPublicTemplates = async (req, res, next) => {
    try {
        const templates = await Form.find({ isTemplate: true });
        res.status(200).json({
            success: true,
            count: templates.length,
            data: templates.map(t => ({
                _id: t._id,
                title: t.title,  
                description: t.description,
                templateImage: t.templateImage,
                templateCategory: t.templateCategory
            }))
        });
    } catch (error) {
        next(error);
    }
};

exports.updateTemplate = async (req, res, next) => {
  try {
    const { title, description, fields, templateCategory, templateImage } = req.body;
    
    const template = await Form.findOneAndUpdate(
      { 
        _id: req.params.id,
        isTemplate: true,
        createdBy: req.user.id
      },
      { 
        title, 
        description, 
        fields, 
        templateCategory, 
        templateImage 
      },
      { new: true, runValidators: true }
    );

    if (!template) {
      return next(new ErrorHandler('Template not found', 404));
    }

    res.status(200).json({
      success: true,
      data: template
    });
  } catch (error) {
    next(error);
  }
};

exports.getTemplateById = async (req, res, next) => {
    try {
        const template = await Form.findOne({
            _id: req.params.id,
            isTemplate: true
        });

        if (!template) {
            return res.status(404).json({
                success: false,
                message: 'Template not found'
            });
        }

        res.status(200).json({
            success: true,
            data: template
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};