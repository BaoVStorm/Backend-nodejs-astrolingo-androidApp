const express = require('express');
const router = express.Router();
const user_jwt = require('../middleware/user_jwt');

const certificateController = require('../controllers/CertificateController');

router.post('/addCertificate', user_jwt, certificateController.addCertificate);

router.post('/addUserAnswers', user_jwt, certificateController.addUserAnswers);

router.get('/getCertificate', certificateController.getCertificate);

// admin
router.get('/getCertificateDoneByWeek', certificateController.getCertificateDoneByWeek);
router.get('/getTop10LastestCertificates', certificateController.getTop10LastestCertificates);

module.exports = router;