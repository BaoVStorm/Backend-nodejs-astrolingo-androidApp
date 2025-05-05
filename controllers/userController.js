const jwt = require('jsonwebtoken');
const Users = require('../models/Users');
const bcryptjs = require('bcryptjs');
const {sendVerificationOTPEmail, verifyUserEmail} = require('./email_verificationController');
const { use } = require('../routes/email_verification');

// Đăng ký
exports.register = async (req, res, next) => {  
  // res.json({
  //   test: "testing"
  // });

  let {user_name, email, phone_number, password, provider} = req.body;

  user_name = user_name.trim();
  email = email.trim();
  if(phone_number)
    phone_number = phone_number.trim();
  password = password.trim();

  try{
    let user_exist = await Users.findOne({user_name: user_name});

    if(user_exist) {
      return res.status(400).json({
          success: false,
          msg: 'User already exists. Please use another username!'
      });
    }

    user_exist = await Users.findOne({email: email});

    if(user_exist) {
      return res.status(400).json({
          success: false,
          msg: 'Email already exists. Please use another Email!'
      });
    }

    let user = new Users();

    user.user_name = user_name;
    user.full_name = user_name;
    user.email = email;
    user.phone_number = phone_number;
    
    if(provider == null)
      user.provider = 'local';
    else
      user.provider = provider;

    const salt = await bcryptjs.genSalt(10);
    user.password_hash = await bcryptjs.hash(password, salt);

    await user.save();

    // verification account
    await sendVerificationOTPEmail(email);

    const payload = {
      user: {
        id: user.id
      }
    }    

    jwt.sign(payload, process.env.jwtUserSecret, {
      expiresIn: 360000
    }, (err, token) => {

      user.token = token;

      if(err) 
        throw err;

      return res.status(200).json({
        success: true,
        msg: "Register User successfully! Need verify Email",
        user_id: user.id,
        token: token,
        user: user
      });
      
    });

    await user.save();
    
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
  let {user_name, password} = req.body;

  user_name = user_name.trim();
  password = password.trim();

  try {
    let user = await Users.findOne({user_name: user_name});

    if(!user) {
      user = await Users.findOne({email: user_name});

      if(!user) {
        return res.status(400).json({
          success: false,
          error_server: false,
          msg: 'Username or Email not exists!'
        });
      }
 
    }

    // check verify account
    if(!user.verified) {
      return res.status(400).json({
        success: false,
        error_server: false,
        verified: false,
        email: user.email,
        msg: "Email hasn't been verified yet. Check your inbox!"
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

      user.token = token;

      return res.status(200).json({
        success: true,
        msg: 'User logged in!',
        user_id: user.id,
        token: token,
        user: user
      });
    });

    await user.save();

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
        const user = await Users.findById(req.user.id).select('-password_hash');

        // Nếu không tìm thấy người dùng
        if (!user) {
          return res.status(404).json({
              success: false,
              msg: 'User not found.'
          });
        } 

        // check verify account
        if(!user.verified) {
          return res.status(400).json({
            success: false,
            msg: "Email hasn't been verified yet."
          });
        }

        res.status(200).json({
            success: true,
            user_id: user.id,
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
    let {google_id, email, full_name, photo_url} = req.body;
  
    google_id = google_id.trim();
    email = email.trim();
    full_name = full_name.trim();
    photo_url = photo_url.trim();

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
        user.verified = true;

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
        if(err) 
          throw err;
  
        user.token = token;

        return res.status(200).json({
          success: true,
          msg: 'Login Google Successfully!',
          isNewAccount: isNewAccount,
          token: token,
          user_id: user.id,
          user: user
        });
      });
  
      await user.save();
  
    } catch(err) {
      console.log(err.message);
  
      return res.status(500).json({
        success: false,
        msg: 'Google Login Server Error!'
      });
    }
};

exports.logout = async (req, res) => {
  try {
      const user = await Users.findById(req.user.id);

      // Nếu không tìm thấy người dùng
      if (!user) {
        return res.status(404).json({
            success: false,
            msg: 'User not found or already logged out.'
        });
      } 

      return res.status(200).json({ success: true, msg: 'Logged out successfully' });

  } catch(err) {
      console.log(err.message);
      res.status(500).json(
      {
          success: false,
          msg: 'Server Error'
      });
  }
};