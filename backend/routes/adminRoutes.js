const express = require('express');
const router = express.Router();
const {
  getDashboardData
} = require('../controllers/adminDashboardController');
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
router.post('/templates', protect, admin, createTemplate);
router.get('/templates', protect, admin, getTemplates);
router.get('/templates/:id', protect, admin, getTemplateById);
router.delete('/templates/:id', protect, admin, deleteTemplate);
router.post('/templates/:templateId/create-form', protect, createFormFromTemplate);
// Add this route
router.put('/templates/:id', protect, admin, updateTemplate);

module.exports = router;