const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    user_name: {
      type: String,
      required: true,
      unique: true,
    },
    full_name: {
      type: String,
      required: true,
      maxlength: 100
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      maxlength: 100
    },
    phone_number: {
      type: String,
      maxlength: 15
    },
    password_hash: {
      type: String,
      required: true,
      maxlength: 255
    },
    date_of_birth: {
      type: Date
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      maxlength: 6
    }
  },
  {
    timestamps: true // Tự động tạo createdAt & updatedAt
  }
);

module.exports = mongoose.model("Users", userSchema);
