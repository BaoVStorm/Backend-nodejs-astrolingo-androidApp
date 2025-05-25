const express = require('express');
const router = express.Router();
const user_jwt = require('../middleware/user_jwt');

// - table init
const VocabulariesController = require('../controllers/VocabulariesController');

// ----------- function
// lấy tất cả các test trong database
router.post('/getListWords', user_jwt, VocabulariesController.getListWords);


module.exports = router;