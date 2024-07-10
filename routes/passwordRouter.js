var express = require("express");
var passwordRouter = express.Router();

const { forgetPassword } = require("../controllers/Auth/auth");

// Routes for forget-password
passwordRouter.get("/forget-password", (req, res) => {
  res.render("Pages/pages-recoverpw");
  //   res.render("Partials/Breadcrumb");
  //   res.send("Hello World");
});

passwordRouter.post("/forget-password", forgetPassword);

module.exports = passwordRouter;
