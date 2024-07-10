var express = require("express");
var subscriptionRouter = express.Router();

const {
  addSubscription,
  addedSubscription,
  listSubscriptions,
  removeSubscription,
  subscriptionDetails,
  updateSubscription,
  updatedSubscription,
} = require("../controllers/Subscription/subscription");
const { isAuthenticated } = require("../middleware/authGaurd");

// Routes for Subscription
subscriptionRouter.get("/create", addSubscription);

subscriptionRouter.post("/create", addedSubscription);

subscriptionRouter.get("/list", listSubscriptions);

subscriptionRouter.get(
  "/removeSubscription/:subscription_id",
  removeSubscription
);

subscriptionRouter.get(
  "/:subscription_id/details",
  subscriptionDetails
);

subscriptionRouter.get(
  "/:subscription_id/edit",
  updateSubscription
);

subscriptionRouter.post(
  "/:subscription_id/edit",
  updatedSubscription
);

module.exports = subscriptionRouter;
