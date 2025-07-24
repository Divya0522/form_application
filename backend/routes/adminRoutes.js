const express = require('express');
const router = express.Router();
const {
  getDashboardData
} = require('../controllers/adminDashboardController');
const {
  createTemplate,
  getTemplates,
  createFormFromTemplate,
  deleteTemplate
} = require('../controllers/templateController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.get('/dashboard', protect, admin, getDashboardData);
router.post('/templates', protect, admin, createTemplate);
router.get('/templates', protect, admin, getTemplates);
router.delete('/templates/:id', protect, admin, deleteTemplate);
router.post('/templates/:templateId/create-form', protect, createFormFromTemplate);

module.exports = router;