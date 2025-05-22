const express = require('express');
const router = express.Router();
const user_jwt = require('../middleware/user_jwt');

const certificateController = require('../controllers/CertificateController');

router.post('/addCertificate', user_jwt, certificateController.addCertificate);

router.post('/addUserAnswers', user_jwt, certificateController.addUserAnswers);

module.exports = router;