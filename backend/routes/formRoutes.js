const express = require('express');
const router = express.Router();
const { 
  getUserForms,
   createForm,
  getForm,
updateForm,
deleteForm,
getPublicForm,
publishForm,
unpublishForm } = require('../controllers/formController');
const { protect } = require('../middlewares/authMiddleware');

const {submitResponse}=require("../controllers/responseController");


router.route('/')
  .get(protect, getUserForms)
  .post(protect, createForm);


router.route('/:id')
  .get(protect, getForm)
  .put(protect, updateForm)
  .delete(protect, deleteForm);

router.get('/public/:id', getPublicForm);
// Form responses
router.post('/:formId/responses',protect, submitResponse);
  router.put('/:id/publish', protect, publishForm);
  router.put('/:id/unpublish', protect, unpublishForm);
  module.exports = router;