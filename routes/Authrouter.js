var express = require("express");
var Authrouter = express.Router();

// Routes for transporter Register
Authrouter.get("/transporter-register", (req, res) => {
  res.render("TransporterRegister/registerTransporter");
});

//Routes for Authentications.
Authrouter.get("/", (req, res) => {
  res.render("Pages/pages-login");
});

Authrouter.get("/pages-coming-soon", (req, res) => {
  res.render("Pages/pages-coming-soon");
});
Authrouter.get("/pages-lock-screen", (req, res) => {
  res.render("Pages/pages-lock-screen");
});

Authrouter.get("/pages-maintenance", (req, res) => {
  res.render("Pages/pages-maintenance");
});

Authrouter.get("/forget-password", (req, res) => {
  res.render("Pages/pages-recoverpw");
});

Authrouter.get("/pages-register", (req, res) => {
  res.render("Pages/pages-register");
});

Authrouter.get("/pages-comingsoon", (req, res) => {
  res.render("Pages/pages-comingsoon");
});

module.exports = Authrouter;
