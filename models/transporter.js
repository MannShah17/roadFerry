const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const transporterSchema = new Schema(
  {
    phone_number: {
      type: String,
      required: true,
    },
    first_name: {
      type: String,
      default: "",
    },
    last_name: {
      type:String,
      default:"",
    },
    email: {
      type: String,
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

module.exports = mongoose.model("Transporter", transporterSchema);
