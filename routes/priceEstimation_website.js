var express = require("express");
var priceEstimationRouter = express.Router();

const {
  calculatePriceDistance,
} = require("../controllers/PriceEstimation_Website/calculatePrice");

// Routes for Subscription
priceEstimationRouter.post("/estimation", calculatePriceDistance);

module.exports = priceEstimationRouter;