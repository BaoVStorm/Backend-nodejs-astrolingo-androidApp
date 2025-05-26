const express = require('express');
const router = express.Router();
const user_jwt = require('../middleware/user_jwt');

// - table init
const VocabulariesController = require('../controllers/UserStarsController');

// ----------- function
// lấy tất cả các test trong database
router.post('/getWordUserStars', VocabulariesController.getWordUserStars);
router.post('/addWordUserStars', user_jwt, VocabulariesController.addWordUserStars);

module.exports = router;