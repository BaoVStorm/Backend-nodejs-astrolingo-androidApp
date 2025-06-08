const express = require('express');
const router = express.Router();
const user_jwt = require('../middleware/user_jwt');

// - table init
const UserLookupHistoryController = require('../controllers/UserLookupHistoryController');

// ----------- function
// lấy tất cả các test trong database
router.post('/addLookUpHistory', user_jwt, UserLookupHistoryController.addLookUpHistory);
router.post('/getLookUpHistory', user_jwt, UserLookupHistoryController.getLookUpHistory);
router.get('/getLookUpCount', UserLookupHistoryController.getLookUpCount);

// admin
router.get('/getLookupDoneByWeek', UserLookupHistoryController.getLookupDoneByWeek);
router.get('/getTopUsersByLookupCount', UserLookupHistoryController.getTopUsersByLookupCount);

module.exports = router;