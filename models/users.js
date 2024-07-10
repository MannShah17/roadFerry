const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    phone_number: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      default: "",
    },
    email: {
      type: String,
    },
    dob: {
      type: Date,
    },
    password: {
      type: String,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    is_block: {
      type: Boolean,
      default: false,
    },
    is_verified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
