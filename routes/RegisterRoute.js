var express = require("express");
var RegisterRouter = express.Router();
var location = require("location-href");
const authController = require("../controllers/Auth2/auth.controllers");

RegisterRouter.post(
  "/register",
  authController.signup,
  (req, res) => {
    const data = req.body;
    console.log(data,"data")
    res.render("Payment/otp",data);
  }
);

RegisterRouter.post("/resend", authController.sendOtp, (req, res) => {
  console.log("resend");
  console.log(req.body, "Bodyyyyy");
  const name = req.body.name;
  const phone_number = req.body.phone_number;
  res.render("Payment/otp", { phone_number, name });
});

RegisterRouter.get("/register", (req, res) => {
  res.render("Payment/login");
});

RegisterRouter.post("/otp", 
  authController.verifyOtp, 
  async (req, res) => {
  const otp = req.body;
//  location.set("Payment/transporterdetails",otp)
//  res.status(200).send(otp)
console.log("OTP Resp", req.body)
 res.render("Payment/transporterdetails", { ...otp });
}
);

// RegisterRouter.get("/transporterdetails", 
// async (req, res) => {
//   const otp = req.body;
//  console.log("otp",otp)
//   res.render("Payment/transporterdetails", otp)
// }
// );

RegisterRouter.get(
  "/updatetransporter",
  (req,res) => {
    return res.render("Payment/appUrl",{
      user_data:{}
    })
  }
);

RegisterRouter.post(
  "/updatetransporter",
  authController.updateTransporter
);

module.exports = RegisterRouter;
