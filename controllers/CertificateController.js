// init table
const mongoose = require('mongoose');
const Certificate = require('../models/Certificates');
const UserAnswer = require('../models/UserAnswers');
const moment = require("moment-timezone");

// lấy thêm bằng (kết quả thi) của 1 bài test của người dùng
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

exports.getCertificate = async (req, res) => {
  try {
    const { user_id } = req.query; 

    if (!user_id)
      return res.status(400).json({ msg: "user_id is required" });

    const objectId_user = new mongoose.Types.ObjectId(user_id);

    const certificates = await Certificate.find({ user_id: objectId_user });

    const certificates_VietNamTime = certificates.map(item => {
      const itemObject = item.toObject();
      itemObject.awarded_at_vietnam = moment(item.awarded_at)
        .tz("Asia/Ho_Chi_Minh")
        .format("DD/MM/YYYY | HH:mm:ss");
      
      return itemObject;
    });

    return res.status(200).json({
      msg: "Certificates fetched successfully",
      certificates: certificates_VietNamTime,
    });
  } catch (err) {
    console.error("Get certificate error:", err);
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

        // Xoá toàn bộ câu trả lời cũ của user cho bài test này
        await UserAnswer.deleteMany({
            user_id: objectIdUser,
            test_id: test_id
        });

        const answerDocs = answers.map((ans) => ({
            user_id: objectIdUser,
            test_id: test_id,
            selected_answer: ans.selected_answer,
            correct_answer: ans.correct_answer,
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


exports.getCertificateDoneByWeek = async (req, res) => {
  try {
    const result = await Certificate.aggregate([
      {
        $group: {
          _id: { $dayOfWeek: "$awarded_at" }, // 1 = Sunday, 2 = Monday, ..., 7 = Saturday
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          day: "$_id",
          count: 1
        }
      }
    ]);

    // Tạo mảng 7 phần tử, khởi tạo bằng 0
    const testCounts = Array(7).fill(0);

    // Gán số lượng test tương ứng vào từng thứ (Chuyển dayOfWeek Mongo sang [Mon=0, ..., Sun=6])
    result.forEach(item => {
      const mongoDay = item.day; // 1=Sun, 2=Mon, ..., 7=Sat
      const jsDayIndex = (mongoDay + 5) % 7; // chuyển về index JS [Mon=0,...,Sun=6]
      testCounts[jsDayIndex] = item.count;
    });

    return res.status(200).json(testCounts);// [Mon, Tue, Wed, ..., Sun]

  } catch (err) {
    console.error("Error saving answers:", err);
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
}


exports.getTop10LastestCertificates = async (req, res) => {
  try {
    const result = await Certificate.aggregate([
      // Join với bảng User để lấy email
      {
        $lookup: {
          from: "users", // tên collection (viết thường, số nhiều theo default của Mongo)
          localField: "user_id",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },

      // Tính tỷ lệ hoàn thành và format thời gian
      {
        $addFields: {
          completion_rate: {
            $cond: [
              { $eq: [{ $add: ["$correct_count", "$wrong_count"] }, 0] },
              0,
              {
                $multiply: [
                  { $divide: ["$correct_count", { $add: ["$correct_count", "$wrong_count"] }] },
                  100
                ]
              }
            ]
          },
          awarded_at_formatted: {
            $dateToString: {
              format: "%d-%m-%Y | %H:%M",
              date: "$awarded_at",
              timezone: "Asia/Ho_Chi_Minh"
            }
          }
        }
      },

      // Sắp xếp theo thời gian gần nhất
      { $sort: { awarded_at: -1 } },

      // Lấy 10 bản ghi gần nhất
      { $limit: 10 },

      // Chỉ lấy các trường cần thiết
      {
        $project: {
          _id: 0,
          test_id: 1,
          certificate_name: 1,
          email: "$user.email",
          correct_count: 1,
          wrong_count: 1,
          completion_rate: { $round: ["$completion_rate", 2] },
          awarded_at: "$awarded_at_formatted"
        }
      }
    ]);

    // console.log("Top 10 certificates gần nhất:");
    // console.table(result); 
    return res.status(200).json(result);

  } catch (err) {
    console.error("Error saving answers:", err);
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
};