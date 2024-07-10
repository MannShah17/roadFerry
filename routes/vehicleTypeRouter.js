var express = require("express");
var vehicleTypeRouter = express.Router();
var multer = require("multer");

const {
  newVehicleType,
  listVehicleTypes,
  removeVehicleType,
  vehicleTypeDetails,
  updateVehicleType,
  updatedVehicleType,
} = require("../controllers/VehicleType/vehicleType");
const { isAuthenticated } = require("../middleware/authGaurd");

var storage = multer.memoryStorage();

// const fileFilter = async function (req, file, cb) {
//   if (
//     file.mimetype === "image/jpeg" ||
//     file.mimetype === "image/png" ||
//     file.mimetype === "image/jpg"
//   ) {
//     await cb(null, true);
//   } else {
//     await cb(null, false);
//   }
// };

var upload = multer({
  storage: storage,
  // limits: {
  //   fileSize: 1024 * 1024 * 5,
  // },
  // fileFilter: fileFilter,
});

// Routes for Vehicle-Type
vehicleTypeRouter.get("/create", (req, res) => {
  res.render("VehicleType/addVehicleType");
});

vehicleTypeRouter.post(
  "/create",
  upload.any("icons"),
  // upload.single("icons"),
  newVehicleType
);

vehicleTypeRouter.get("/list", listVehicleTypes);

// Make temporarily delete still left to add a subscription part
vehicleTypeRouter.post("/removeVehicleType/:vehicleType_id", removeVehicleType);

vehicleTypeRouter.get(
  "/:vehicleType_id/details",
  vehicleTypeDetails
);

vehicleTypeRouter.get("/:vehicleType_id/edit", updateVehicleType);

vehicleTypeRouter.post("/:vehicleType_id/edit", updatedVehicleType);

module.exports = vehicleTypeRouter;
