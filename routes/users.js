const express = require('express');
const router = express.Router();
const Users = require('../models/Users');
const bcryptjs = require('bcryptjs');
const user_jwt = require('../middleware/user_jwt');
const jwt = require('jsonwebtoken');

// đăng ký tài khoản
router.post('/register', async (req, res, next) => {  
  // res.json({
  //   test: "testing"
  // });

  const {user_name, full_name, phone_number, password} = req.body;

  try{
    let user_exist = await Users.findOne({user_name: user_name});

    if(user_exist) {
      res.json({
          success: false,
          msg: 'User already exists'
      });
    }

    let user = new Users();

    user.user_name = user_name;
    user.full_name = full_name;
    user.phone_number = phone_number;
    
    const salt = await bcryptjs.genSalt(10);
    user.password_hash = await bcryptjs.hash(password, salt);

    await user.save();

    const payload = {
      user: {
        id: user.id
      }
    }    

    jwt.sign(payload, process.env.jwtUserSecret, {
      expiresIn: 360000
    }, (err, token) => {
      if(err) throw err;
      res.status(200).json({
        success: true,
        token: token
      });
    });

    // res.json({
    //   success: true,
    //   msg: 'User registered',
    //   user: user
    // })

  } catch(err) {
    console.log(err);
  }

  console.log(req.body);
});

// authorization (chỉ có người dùng đã đăng nhập mới có quyền truy cập)
router.get('/', user_jwt, async (req, res, next) => {
  try {

    const user = await Users.findById(req.user.id).select('-password');
    res.status(200).json({
      success: true,
      user: user
    });

  } catch(err) {
    console.log(err.message);
    res.status(500).json({
      success: false,
      msg: 'Server Error'
    });
    next();
  }
});

// đăng ký tài khoản
router.post('/login', async (req, res, next) => {  
  const {user_name, password} = req.body;

  try {
    let user = await Users.findOne({user_name: user_name});

    if(!user) {
      res.status(400).json({
        success: false,
        msg: 'username not exists go & register to continue.'
      });
    }

    const isMatch = await bcryptjs.compare(password, user.password_hash)

    if(!isMatch) {
      res.status(400).json({
        success: false,
        msg: 'Password is invalid'
      });
    }

    // lưu token đăng nhập thành công
    const payload = {
      user: {
        id: user.id
      }
    }    

    jwt.sign(payload, process.env.jwtUserSecret, {
      expiresIn: 360000
    }, (err, token) => {
      if(err) throw err;

      res.status(200).json({
        success: true,
        msg: 'User logged in',
        token: token,
        user: user
      });
    });

  } catch(err) {
    console.log(err.message);

    res.status(500).json({
      success: false,
      msg: 'Server Error'
    });
  }

});

module.exports = router;
