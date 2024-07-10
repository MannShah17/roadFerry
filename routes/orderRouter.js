var express = require("express");
var orderRouter = express.Router();

const { listOrders, orderDetails, exportDetails,filterOrder, endOrderTrip } = require("../controllers/Order/order");
const { isAuthenticated } = require("../middleware/authGaurd");

// Routes for Orders
orderRouter.get("/list", listOrders);
orderRouter.post("/list", filterOrder);

orderRouter.get("/:order_id/details", orderDetails);

orderRouter.put("/end-trip", endOrderTrip);

// orderRouter.post("/neel",exportDetails)
// orderRouter.get("/exportDetails/startDateDetails/endDateDetails",exportDetails)
module.exports = orderRouter;
