const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const mongoose = require('mongoose');

// init table
const UserLookupHistory = require('../models/UserLookupHistory');

// ------------- function

// lấy danh sách các test đang có trong database
exports.addLookUpHistory = async (req, res) => {
  try {
    const { user_id, word, meaning, isTranslateEnglish, vocab_id } = req.body;

    if (!user_id || !word || !meaning || typeof isTranslateEnglish !== 'boolean') {
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
