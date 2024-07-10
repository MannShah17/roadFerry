const User = require("../../models/users");
const Transporter = require("../../models/transporter");
const accountID = process.env.ACCOUNTID;
const authToken = process.env.AUTHTOKEN;
const serviceID = process.env.SERVICEID;
const twilioClient = require("twilio")(accountID, authToken);
const { db } = require("../../config/admin");

/* Create New User */
exports.creatNewUser = async (cat) => {
  return await db.collection("anonymous").doc().set(cat);
  //return await User.create(cat);
};

/* Create New User */
exports.creatNewTransporter = async (cat,user_uid) => {
  return await db.collection("users").doc(user_uid).set(cat);
};

/* Get User By Phone */
exports.getUserByPhoneNumber = async (phone_number) => {
  // return await User.findOne({ phone_number: phone_number });
 
};

/* Verify Otp Phone */
exports.verifyOtpPhone = async (phone_number, code) => {
  const data = await twilioClient.verify
    .services(serviceID)
    .verificationChecks.create({
      to: `+91${phone_number}`,
      code: code,
    })
    .then((data) => {
      return data;
    });
  return data;
};

/* Send Otp Phone */
exports.sendOtpPhone = async (phone_number) => {
  const data = await twilioClient.verify
    .services(serviceID)
    .verifications.create({
      to: `+91${phone_number}`,
      channel: "sms",
    })
    .then((data) => {
      return data;
    });
  return data;
};

/* Update Status */

exports.updateStatus = async (user) => {
  const update_status = await user.updateOne({
    is_verified: true,
  });

  return update_status;
};
