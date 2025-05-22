// init table
const mongoose = require('mongoose');
const Certificate = require('../models/Certificates');
const UserAnswer = require('../models/UserAnswers');

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


exports.addUserAnswers = async (req, res) => {
    try {
        const { user_id, test_id, answers } = req.body;

        if (!user_id || !test_id || !Array.isArray(answers)) {
            return res.status(400).json({ msg: "Missing or invalid parameters" });
        }
        
        console.log("Received body:", req.body);

        const objectIdUser = new mongoose.Types.ObjectId(user_id);

        // 🧹 Xoá toàn bộ câu trả lời cũ của user cho bài test này
        await UserAnswer.deleteMany({
            user_id: objectIdUser,
            test_id: test_id
        });

        const answerDocs = answers.map((ans) => ({
            user_id: objectIdUser,
            test_id: test_id,
            selected_answer: ans.selected_answer,
            is_wrong: ans.is_wrong,
            answered_at: new Date(), // hoặc có thể để mặc định
            question_number: ans.question_number,
            question_id: ans.question_id,
            group_question_id: ans.group_question_id,
            part_id: ans.part_id,
        }));

        const insertedAnswers = await UserAnswer.insertMany(answerDocs);

        return res.status(201).json({
            msg: "Answers saved successfully",
            data: insertedAnswers,
        });
    } catch (err) {
        console.error("Error saving answers:", err);
        return res.status(500).json({ msg: "Server error", error: err.message });
    }
};
