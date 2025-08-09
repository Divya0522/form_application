// const Form = require('../models/Form');
// const ErrorHandler = require('../utils/errorHandler');

// const Response =require('../models/Response');


// exports.getUserForms = async (req, res, next) => {
//   try {
//     const forms = await Form.find({ createdBy: req.user.id }).select('-fields');
//     res.status(200).json(forms); // Return array directly
//   } catch (error) {
//     next(error);
//   }
// };


// exports.createForm = async (req, res, next) => {
//   try {
//     const { title, description, fields } = req.body;
    
//     const form = await Form.create({
//       title,
//       description,
//       createdBy: req.user.id,
//       fields
//     });

//     res.status(201).json({
//       success: true,
//       data: form
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// exports.getForm = async (req, res, next) => {
//   try {
//     const form = await Form.findOne({
//       _id: req.params.id,
//       createdBy: req.user.id
//     });

//     if (!form) {
//       return next(new ErrorHandler('Form not found', 404));
//     }

//     res.status(200).json({
//       success: true,
//       data: form
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// exports.updateForm = async (req, res, next) => {
//   try {
//     const { title, description, fields } = req.body;
    
//     const form = await Form.findOneAndUpdate(
//       { 
//         _id: req.params.id,
//         createdBy: req.user.id
//       },
//       { title, description, fields },
//       { new: true, runValidators: true }
//     );

//     if (!form) {
//       return next(new ErrorHandler('Form not found', 404));
//     }

//     res.status(200).json({
//       success: true,
//       data: form
//     });
//   } catch (error) {
//     next(error);
//   }
// };


// exports.deleteForm = async (req, res, next) => {
//   try {
//     const form = await Form.findOneAndDelete({
//       _id: req.params.id,
//       createdBy: req.user.id
//     });

//     if (!form) {
//       return next(new ErrorHandler('Form not found', 404));
//     }

   
//     await Response.deleteMany({ form: req.params.id });

//     res.status(200).json({
//       success: true,
//       data: {}
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// exports.publishForm = async (req, res, next) => {
//   try {
//     const form = await Form.findOneAndUpdate(
//       { 
//         _id: req.params.id,
//         createdBy: req.user.id
//       },
//       { 
//         isPublished: true,
//         publishedAt: Date.now()
//       },
//       { new: true }
//     );

//     if (!form) {
//       return next(new ErrorHandler('Form not found', 404));
//     }

//     res.status(200).json({
//       success: true,
//       data: form
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// exports.unpublishForm = async (req, res, next) => {
//   try {
//     const form = await Form.findOneAndUpdate(
//       { 
//         _id: req.params.id,
//         createdBy: req.user.id
//       },
//       { 
//         isPublished: false,
//         publishedAt: null
//       },
//       { new: true }
//     );

//     if (!form) {
//       return next(new ErrorHandler('Form not found', 404));
//     }

//     res.status(200).json({
//       success: true,
//       data: form
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// exports.getPublicForm = async (req, res, next) => {
//     try {
//         const form = await Form.findOne({
//             _id: req.params.id,
//             $or: [
//                 { isPublished: true },
//                 { isTemplate: true }
//             ]
//         }).select('-createdBy');

//         if (!form) {
//             return next(new ErrorHandler('Form not found or not published', 404));
//         }

//         res.status(200).json({
//             success: true,
//             data: form
//         });
//     } catch (error) {
//         next(error);
//     }
// };

// // Update getFormWithResponseCount function
// exports.getFormWithResponseCount = async (req, res, next) => {
//   try {
//     const forms = await Form.find({ createdBy: req.user.id })
//       .select('-fields')
//       .lean();

//     const formsWithResponseCount = await Promise.all(
//       forms.map(async (form) => {
//         const responseCount = await Response.countDocuments({ form: form._id }); // Correct usage
//         return {
//           ...form,
//           responseCount
//         };
//       })
//     );

//     res.status(200).json(formsWithResponseCount);
//   } catch (error) {
//     next(error);
//   }
// };
// // Add to formController.js
// exports.getTemplateById = async (req, res) => {
//   try {
//     const form = await Form.findOne({
//       _id: req.params.id,
//       isTemplate: true
//     });
    
//     if (!form) {
//       return res.status(404).json({ message: 'Template not found' });
//     }
    
//     res.json({ data: form });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

const Form = require('../models/Form');
const ErrorHandler = require('../utils/errorHandler');
const Response = require('../models/Response');

exports.getUserForms = async (req, res, next) => {
  try {
    const forms = await Form.find({ createdBy: req.user.id }).select('-fields');
    res.status(200).json(forms);
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
      $or: [
        { isPublished: true },
        { isTemplate: true }
      ]
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

exports.getFormWithResponseCount = async (req, res, next) => {
  try {
    const forms = await Form.find({ createdBy: req.user.id })
      .select('-fields')
      .lean();

    const formsWithResponseCount = await Promise.all(
      forms.map(async (form) => {
        const responseCount = await Response.countDocuments({ form: form._id });
        return {
          ...form,
          responseCount
        };
      })
    );
    res.status(200).json(formsWithResponseCount);
  } catch (error) {
    next(error);
  }
};

exports.getTemplateById = async (req, res) => {
  try {
    const form = await Form.findOne({
      _id: req.params.id,
      isTemplate: true
    });
    if (!form) {
      return res.status(404).json({ message: 'Template not found' });
    }
    res.json({ data: form });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};