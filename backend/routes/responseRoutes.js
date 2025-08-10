// const express = require('express');
// const router = express.Router();
// const { submitResponse, getFormResponses,getResponseCount } = require('../controllers/responseController');
// const { protect } = require('../middlewares/authMiddleware');


// router.route('/:formId')
//   .get(protect, getFormResponses)
//   .post(submitResponse);  
// router.get('/:formId/count', protect, getResponseCount);

// module.exports = router;


const express = require('express');
const router = express.Router();
const { submitResponse, getFormResponses, getResponseCount,getResponseCounts } = require('../controllers/responseController');
const { protect } = require('../middlewares/authMiddleware');


router.post('/:formId', submitResponse);

router.get('/:formId', protect, getFormResponses);
router.get('/:formId/count', protect, getResponseCount);
router.get('/:id/counts', protect, getResponseCounts);
module.exports = router;