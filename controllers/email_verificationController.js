const Users = require('../models/Users');
const {sendOTP, verifyOTP, deleteOTP} = require('../controllers/OTPController');

const verifyUserEmail = async({email, otp}) => {
    try{
        const validOTP = await verifyOTP({email, otp});
        if(!validOTP) {
            throw Error("Invalid code passed. Check your inbox.");
        }

        await deleteOTP(email);
        return;
    } catch(error) {
        throw error;
    }
}

const sendVerificationOTPEmail = async(email) => {
    try {
        // check if an account exists
        const existingUser = await Users.findOne({email});
        if(!existingUser) {
            throw Error("There's no account for the provided email.");
        }

        const otpDetails = {
            email,
            subject: "ASTROLINGO: Email Verification",
            message: "Verify your email with the code below.",
            duration: 10,
        }
        
        const createOTP = await sendOTP(otpDetails);
        return createOTP;
    } catch(error) {

    }
};

module.exports = {sendVerificationOTPEmail, verifyUserEmail};