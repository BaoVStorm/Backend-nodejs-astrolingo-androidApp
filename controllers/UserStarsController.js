const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const mongoose = require('mongoose');
const moment = require("moment-timezone");

// init table
const UserStar = require('../models/UserStars');
const Vocabulary = require('../models/Vocabularies');
const UserLookupHistory = require('../models/UserLookupHistory');


// ------------- function

exports.getWordUserStars = async (req, res) => {
  try {
    const {user_id} = req.body;

    if (!user_id) {
      return res.status(400).json({
        msg: "user_id is required"
      });
    }

    const objectId_user = new mongoose.Types.ObjectId(user_id);

    const userStars = await UserStar.find({user_id: objectId_user}).sort({type: 1, starred_at: 1});

    return res.status(200).json({
      msg: "userStars are listed successfully",
      userStars
    });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.addWordUserStars = async (req, res) => {
  try {
    const {user_id, word, meaning, type_star, vocab_id, user_lookup_id} = req.body;

    if (!user_id || !type_star) {
      return res.status(400).json({
        msg: "user_id or type_star is required"
      });
    }

    if(!["translate", "vocabulary", "create"].includes(type_star))
      return res.status(400).json({
        msg: "type must be in ['translate', 'vocabulary', 'create']"
      });

    const objectId_user = new mongoose.Types.ObjectId(user_id);

    const data = {
      user_id: objectId_user,
      type_star
    };

    if (vocab_id) {
      const ObjectId_vocab = new mongoose.Types.ObjectId(vocab_id);

      const vocab = await Vocabulary.findById(ObjectId_vocab);
    
      if(!vocab)
        return res.status(400).json({
          msg: "vocab_id is not valid"
        });

      data.vocab_id = ObjectId_vocab;

      if (vocab.word) 
        data.word = vocab.word; 

      if(vocab.type)
        data.type = vocab.type;

      if(vocab.pronunciation)
        data.pronunciation = vocab.pronunciation;

      if(vocab.meaning_vietnamese)
        data.meaning_vietnamese = vocab.meaning_vietnamese;
      
      if(vocab.meaning_english)
        data.meaning_english = vocab.meaning_english;
      
      if(vocab.example_vietnamese)
        data.example_vietnamese = vocab.example_vietnamese;
      
      if(vocab.example_english)
        data.example_english = vocab.example_english;
      
      if(vocab.image_url)
        data.image_url = vocab.image_url;
      
      if(vocab.audio_url)
        data.audio_url = vocab.audio_url;
    }
    if (word) {
      data.word = word;
    }
    if (meaning) {
      data.meaning = meaning;
    }

    if(user_lookup_id) {
      const ObjectId_UserLookup = new mongoose.Types.ObjectId(user_lookup_id);

      const userLookupHistory = await UserLookupHistory.findById(ObjectId_UserLookup);

      if(!userLookupHistory)
        return res.status(400).json({
          msg: "user_lookup_id is not valid"
        });

      data.user_lookup_id = ObjectId_UserLookup;
    }

    const newUserStars = new UserStar(data);
    const createdUserStars = await newUserStars.save();

    return res.status(200).json({
      msg: "userStars are successfully",
      userStars: createdUserStars
    });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};