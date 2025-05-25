const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const mongoose = require('mongoose');
const moment = require("moment-timezone");

// init table
const UserLookupHistory = require('../models/UserLookupHistory');

// ------------- function

// lấy danh sách các test đang có trong database
exports.addLookUpHistory = async (req, res) => {
  try {
    const { user_id, word, meaning, isTranslateEnglish, vocab_id } = req.body;

    if (!user_id || !word || !meaning || !isTranslateEnglish) {
      return res.status(400).json({
        msg: "user_id, word, meaning and isTranslateEnglish are required"
      });
    }

    const objectId_user = new mongoose.Types.ObjectId(user_id);

    // Step 1: Đếm số bản ghi hiện có của user
    const count = await UserLookupHistory.countDocuments({ user_id: objectId_user });

    // Step 2: Nếu >= 20 thì xoá bản ghi cũ nhất
    if (count >= 20) {
      await UserLookupHistory
        .findOneAndDelete({ user_id: objectId_user })
        .sort({ lookup_at: 1 }); // oldest first
    }

    // Step 3: Lưu bản ghi mới
    const data = {
      user_id: objectId_user,
      word,
      meaning,
      isTranslateEnglish
    };

    if (vocab_id) {
      data.vocab_id = new mongoose.Types.ObjectId(vocab_id);
    }

    const newUserLookupHistory = new UserLookupHistory(data);
    const createdUserLookupHistory = await newUserLookupHistory.save();

    return res.status(201).json({
      msg: "UserLookupHistory created successfully",
      UserLookupHistory: createdUserLookupHistory
    });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};


exports.getLookUpHistory = async (req, res) => {
  try {
    const { user_id} = req.body;

    if (!user_id) {
      return res.status(400).json({
        msg: "user_id is required"
      });
    }

    const objectId_user = new mongoose.Types.ObjectId(user_id);

    const list = await UserLookupHistory.find({user_id: user_id}).sort({lookup_at: -1}); // sort theo thời gian mới nhất

    // Convert lookup_at về giờ Việt Nam
    const listUserLookupHistory = list.map(item => {
      const itemObject = item.toObject(); // convert Mongoose doc to plain object
      itemObject.lookup_at_vietnam = moment(item.lookup_at)
        .tz("Asia/Ho_Chi_Minh")
        .format("DD/MM/YYYY | HH:mm:ss");
      return itemObject;
    });

    return res.status(200).json({
      msg: "UserLookupHistory is listed successfully",
      listUserLookupHistory
    });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
