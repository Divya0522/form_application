
const express = require('express');
const router = express.Router();
const {
  getDashboardData,
  getAllUsers,
  getAllForms,
  getAllResponses
} = require('../controllers/adminController');
const {
  createTemplate,
  getTemplates,
  createFormFromTemplate,
  deleteTemplate,
  updateTemplate,
  getTemplateById
} = require('../controllers/templateController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.get('/dashboard', protect, admin, getDashboardData);
router.get('/users', protect, admin, getAllUsers);
router.get('/forms', protect, admin, getAllForms);
router.get('/responses', protect, admin, getAllResponses);
router.post('/templates', protect, admin, createTemplate);
router.get('/templates', protect, admin, getTemplates);
router.get('/templates/:id', protect, admin, getTemplateById);
router.put('/templates/:id', protect, admin, updateTemplate);
router.delete('/templates/:id', protect, admin, deleteTemplate);
router.post('/templates/:templateId/create-form', protect, createFormFromTemplate);

module.exports = router;