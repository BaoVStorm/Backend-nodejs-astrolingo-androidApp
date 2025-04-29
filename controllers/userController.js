const jwt = require('jsonwebtoken');
const Users = require('../models/Users');
const bcryptjs = require('bcryptjs');


// Đăng ký
exports.register = async (req, res, next) => {  
  // res.json({
  //   test: "testing"
  // });

  const {user_name, full_name, phone_number, password, provider} = req.body;

  try{
    let user_exist = await Users.findOne({user_name: user_name});

    if(user_exist) {
      return res.status(400).json({
          success: false,
          msg: 'User already exists. Please use another username!'
      });
    }

    let user = new Users();

    user.user_name = user_name;
    user.full_name = full_name;
    user.phone_number = phone_number;
    
    if(provider == null)
      user.provider = 'local';
    else
      user.provider = provider;


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
      return res.status(200).json({
        success: true,
        msg: "Register User successfully!",
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

    return res.status(400).json({
      success: false,
      msg: 'error'
    });
  }

  console.log(req.body);
};


// Login
exports.login = async (req, res, next) => {  
  const {user_name, password} = req.body;

  try {
    let user = await Users.findOne({user_name: user_name});

    if(!user) {
      return res.status(400).json({
        success: false,
        error_server: false,
        msg: 'Username not exists!'
      });
    }

    const isMatch = await bcryptjs.compare(password, user.password_hash)

    if(!isMatch) {
      return res.status(400).json({
        success: false,
        error_server: false,
        msg: 'Password is invalid!'
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

      return res.status(200).json({
        success: true,
        msg: 'User logged in!',
        token: token,
        user: user
      });
    });

  } catch(err) {
    console.log(err.message);

    return res.status(500).json({
      success: false,
      error_server: true,
      msg: 'Server Error!'
    });
  }

};


// Get Current User
exports.getCurrentUser = async (req, res, next) => {
    try {
  
        const user = await Users.findById(req.user.id).select('-password');
        res.status(200).json({
            success: true,
            user: user
        });
  
    } catch(err) {
        console.log(err.message);
        res.status(500).json(
        {
            success: false,
            msg: 'Server Error'
        });
        next();
    }
};


// Google Auth
exports.googleAuth = async (req, res, next) => {  
    const {google_id, email, full_name, photo_url} = req.body;
  
    try {
      let isNewAccount = false;
      let user = await Users.findOne({google_id: google_id});
  
      if(!user) {
        // chưa tồn tại, tạo user
        user = new Users();
  
        user.google_id = google_id;
        user.email = email;
        user.full_name = full_name;
        user.photo_url = photo_url;
        user.provider = 'google';
  
        isNewAccount = true;
  
        await user.save();
      }
  
      // đã tồn tại user
  
      const payload = {
        user: {
          id: user.id
        }
      }    
  
      jwt.sign(payload, process.env.jwtUserSecret, {
        expiresIn: 360000
      }, (err, token) => {
        if(err) throw err;
  
        return res.status(200).json({
          success: true,
          msg: 'Login Google Successfully!',
          isNewAccount: isNewAccount,
          token: token,
          user: user
        });
      });
  
  
    } catch(err) {
      console.log(err.message);
  
      return res.status(500).json({
        success: false,
        msg: 'Google Login Server Error!'
      });
    }
};