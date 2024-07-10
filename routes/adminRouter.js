var express = require("express");
var adminRouter = express.Router();

const {
  newAdmin,
  listAdmins,
  removeAdmin,
  adminDetails,
  changeAdminStatus,
} = require("../controllers/Admin/admin");
const { isAuthenticated } = require("../middleware/authGaurd");

// adminRouter.get("/transporter-register", (req, res) => {
//   res.render("TransporterRegister/registerTransporter");
// });

// Routes for Admin
adminRouter.get("/create", (req, res) => {
  res.render("Users/Admin/addAdmin",{title:"Logistic-Admin"});
});

adminRouter.post("/create", newAdmin);

adminRouter.get("/list", listAdmins);

adminRouter.post("/removeAdmin/:admin_id", removeAdmin);

adminRouter.get("/:admin_id/details", adminDetails);

adminRouter.post("/status/:admin_id", changeAdminStatus);

module.exports = adminRouter;
