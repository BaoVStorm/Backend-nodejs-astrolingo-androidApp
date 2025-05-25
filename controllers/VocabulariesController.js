const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const mongoose = require('mongoose');
const moment = require("moment-timezone");

// init table
const Vocabulary = require('../models/Vocabularies');

// ------------- function

exports.getListWords = async (req, res) => {
  try {
    const {user_id} = req.body;

    if (!user_id) {
      return res.status(400).json({
        msg: "user_id is required"
      });
    }

    const objectId_user = new mongoose.Types.ObjectId(user_id);

    const vocabularies = await Vocabulary.find().sort({topic_id: 1, level_id: 1});

    return res.status(200).json({
      msg: "vocabularies is listed successfully",
      vocabularies
    });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
