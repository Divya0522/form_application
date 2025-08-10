
const Form = require('../models/Form'); 
const express = require("express");
const router = express.Router();
const {
  getUserForms,
  createForm,
  getForm,
  updateForm,
  deleteForm,
  getPublicForm,
  publishForm,
  unpublishForm,
  getFormWithResponseCount
} = require("../controllers/formController");
const { protect } = require("../middlewares/authMiddleware");
const { submitResponse } = require("../controllers/responseController");

const {
  getTemplates,
  createFormFromTemplate,
  getAllTemplates,
  getPublicTemplates
} = require("../controllers/templateController");

router.route("/")
  .get(protect, getFormWithResponseCount) 
  .post(protect, createForm);
router.route("/")
  .get(protect, getFormWithResponseCount) 
  .post(protect, createForm);
router.route("/:id")
  .get(protect, getForm)
  .put(protect, updateForm)
  .delete(protect, deleteForm);

router.get("/public/:id", getPublicForm);


router.post("/:formId/responses", protect, submitResponse);
router.put("/:id/publish", protect, publishForm);
router.put("/:id/unpublish", protect, unpublishForm);


router.get("/templates/all", protect, getTemplates);
router.post("/templates/:templateId/create-form", protect, createFormFromTemplate);

router.get('/templates', protect, getAllTemplates);
router.get("/templates/public", protect, getPublicTemplates);


router.get('/templates/:id', async (req, res) => {
    try {
        const form = await Form.findOne({ 
            _id: req.params.id, 
            isTemplate: true 
        });
        
        if (!form) {
            return res.status(404).json({ 
                success: false,
                message: 'Template not found' 
            });
        }
        
        res.status(200).json({
            success: true,
            data: form
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
});

module.exports = router;