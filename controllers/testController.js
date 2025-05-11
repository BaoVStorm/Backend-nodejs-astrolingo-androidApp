const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');

// init table
const Tests = require('../models/Tests');
const Parts = require('../models/Parts');
const Group_Questions = require('../models/Group_Questions');
const Questions = require('../models/Questions');

// ------------- function

// lấy danh sách các test đang có trong database
// exports.getListTest = async (req, res) => {
//   try {
//     const {test_id} = req.query;

//     if(!test_id)
//       res.status(400).json({ message: "need test_id to get Test Detail !" });

//     const test = await Tests.findOne({test_id: test_id}); 

//     if(!test)
//       res.status(400).json({ message: "This test is not exist!" });

//     res.json(test);
//   } catch(err) {
//     res.status(500).json({ message: err.message });
//   }
// }

// lấy thông tin test
exports.getTest = async (req, res) => {
  try {
    const {test_id} = req.query;

    if(!test_id)
      res.status(400).json({ message: "need test_id to get Test Detail !" });

    const test = await Tests.findOne({test_id: test_id}); 

    if(!test)
      res.status(400).json({ message: "This test is not exist!" });

    res.json(test);
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
}

// lấy thông tin part
exports.getPart = async (req, res) => {
  try {
    const {part_id} = req.query;

    if(!part_id)
      res.status(400).json({ message: "need part_id to get Part Detail !" });

    const part = await Parts.findOne({part_id: part_id}); 

    if(!part)
      res.status(400).json({ message: "this part is not exist!" });

    res.json(part);
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
}

// lấy danh sách thông tin cụ thể của test (nhiều nhóm câu hỏi)
exports.getListGroupQuestion = async (req, res) => {
  try {
    const {test_id} = req.query;

    if(!test_id)
      res.status(400).json({ message: "need test_id to get list group questions !" });

    const list_groupQuestions = await Group_Questions.find({test_id: test_id}); 

    if(!list_groupQuestions)
      res.status(400).json({ message: `no groupQuestion is belong to test_id: ${test_id}`});

    res.json(list_groupQuestions);
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
}

  // lấy thông tin cụ thể của 1 nhóm câu hỏi (1 GroupQuestion)
  exports.getGroupQuestionDetail = async (req, res) => {
    try {
      const {group_question_id} = req.query;

      if(!group_question_id)
        res.status(400).json({ message: "need group_question_id to get group questions detail !" });

      const groupQuestion = await Group_Questions.findOne({group_question_id: group_question_id}); 

      if(!groupQuestion)
        res.status(400).json({ message: "This groupQuestion is not exist !" });

      res.json(groupQuestion);
    } catch(err) {
      res.status(500).json({ message: err.message });
    }
  }

// lấy danh sách các câu hỏi thuộc 1 nhóm câu hỏi (list Questions in Group_Question)
exports.getListQuestion = async (req, res) => {
  try {
    const {group_question_id} = req.query;

    if(!group_question_id)
      res.status(400).json({ message: "need group_question_id to get list questions !" });
    
    const list_Questions = await Questions.find({group_question_id: group_question_id}); 

    if(!list_Questions)
      res.status(400).json({ message: `no Questions is belong to group_question_id: ${group_question_id}`});

    res.json(list_Questions);
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
}

  // lấy thông tin cụ thể của 1 câu hỏi (1 Question)
  exports.getQuestionDetail = async (req, res) => {
    try {
      const {question_id} = req.query;

      if(!question_id)
        res.status(400).json({ message: "need question_id to get question detail !" });

      const Question = await Questions.findOne({question_id: question_id}); 

      if(!Question)
        res.status(400).json({ message: "This Question is not exist !" });

      res.json(Question);
    } catch(err) {
      res.status(500).json({ message: err.message });
    }
  }