// init table
const mongoose = require('mongoose');
const Certificate = require('../models/Certificates');

// lấy danh sách các test đang có trong database
exports.addCertificate = async (req, res) => {
  try {
    const {test_id, 
        user_id, 
        certificate_name,
        reading_score = 0,
        listening_score = 0,
        total_score = 0,
        correct_count = 0,
        wrong_count = 0
    } = req.body;

    if(!test_id || !user_id)
        return res.status(400).json({ msg: "test_id, user_id are required" });

    const objectId_user = new mongoose.Types.ObjectId(user_id);

    // Certificate.
    const newCertificate = await new Certificate({
        test_id, 
        user_id: objectId_user, 
        certificate_name,
        reading_score,
        listening_score,
        total_score,
        correct_count,
        wrong_count
    });

    const createdCertificate = await newCertificate.save();

    return res.status(201).json({
      msg: "Certificate created successfully",
      certificate: createdCertificate
    });

  } catch(err) {
    console.error("Add certificate error:", err);
    return res.status(500).json({ msg: err.message });
  }
};
