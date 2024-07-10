var express = require("express");
var customerRouter = express.Router();

const {
  listCustomers,
  customerDetails,
  changeCustomerStatus,
  removeCustomer,
} = require("../controllers/Customer/customer");
const { isAuthenticated } = require("../middleware/authGaurd");

// Routes for Customers
customerRouter.get("/list", listCustomers);

// customerRouter.delete("/removeCustomer/:customer_id", removeCustomer);
customerRouter.post("/removeCustomer/:customer_id", removeCustomer);

customerRouter.get("/:customer_id/details", customerDetails);

customerRouter.post("/status/:customer_id", changeCustomerStatus);

module.exports = customerRouter;
