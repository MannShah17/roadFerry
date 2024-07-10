var express = require("express");
var contactRouter = express.Router();

const {
  listContacts,
  contactDetails,
} = require("../controllers/Contact/contact");
const { isAuthenticated } = require("../middleware/authGaurd");

// Routes for Orders
contactRouter.get("/list", listContacts);

contactRouter.get("/:contact_id/details", contactDetails);

module.exports = contactRouter;
