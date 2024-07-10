var express = require("express");
var driverRouter = express.Router();

const {
  changeDriverStatus,
  removeDriver,
  updateDriver,
  updatedDriver,
  transporterDriversList,
  listDrivers,
  dDetails,
  up,
  updDriver,
  driverDetails,
  verifyDriver,
  rejectDriver,
} = require("../controllers/Driver/driver");

const { isAuthenticated } = require("../middleware/authGaurd");

// Routes for Drivers
// driverRouter.get("/:transporter_id/displayDrivers", transporterDriversList);

driverRouter.get("/list",listDrivers);

driverRouter.get("/:transporter_id/details/:id",dDetails);

driverRouter.get("/:transporter_id/update/:driver_id",up);
driverRouter.post("/:transporter_id/update/:driver_id",updDriver)

driverRouter.get("/:transporter_id/driverDetails/:driver_id", driverDetails);

driverRouter.get("/:transporter_id/edit/:driver_id", updateDriver);

driverRouter.post("/:transporter_id/edit/:driver_id", updatedDriver);

driverRouter.post("/:transporter_id/removeDriver/:driver_id", removeDriver);

driverRouter.post("/:transporter_id/status/:driver_id", changeDriverStatus);

driverRouter.get("/:transporter_id/verifyDriver/:driver_id", verifyDriver);

driverRouter.get("/:transporter_id/rejectDriver/:driver_id", rejectDriver);

module.exports = driverRouter;
