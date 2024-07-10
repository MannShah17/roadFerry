const { db, firebase } = require("../../config/admin");
// const { validateDriverData } = require("./driverHelper");

// Get Vehicle's list of a perticular Transporter Controller
// exports.transporterVehiclesList = async (req, res) => {
//   try {
//     const vehicles = [];
//     const id = req.params.transporter_id;

//     // console.log("************ID", id);

//     const data = await db.collection("users").doc(id);
//     const getVehicles = await data.collection("vehicle_details").get();

//     getVehicles.forEach(async (doc) => {
//       if (doc.data().is_deleted === false) {
//         const vehicle = {
//           id: doc.id,
//           vehicleData: doc.data(),
//           transporter_id: id,
//         };
//         vehicles.push(vehicle);
//       }
//     });
//     return res.render("Vehicle/displayTransporterVehicles", {
//       vehicles: vehicles,
//     });
//   } catch (error) {
//     const errors = [];
//     errors.push({ msg: error.message });
//     return res.render("Users/Transporter/displayTransporters", {
//       errors: errors,
//     });
//   }
// };

// Get Vehicle details Controller
exports.vehicleDetails = async (req, res) => {
  const errors = [];
  const vehicle_id = req.params.vehicle_id;
  const transporter_id = req.params.transporter_id;
  try {
    const transporter = await db.collection("users").doc(transporter_id);
    const getVehicle = await transporter
      .collection("vehicle_details")
      .doc(vehicle_id)
      .get();
    const data = await getVehicle.data();
    if (data === undefined) {
      errors.push({ msg: "Vehicle not found...!!" });
      return res.render("Errors/errors", {
        errors: errors,
      });
    }
    const vehicle = { id: data.id, vehicleData: data };
    return res.render("Vehicle/vehicleDetails", {
      vehicle: vehicle,
    });
  } catch (error) {
    console.log(error);
    const errors = [];
    errors.push({ msg: error });
    return res.render("Errors/errors", {
      errors: errors,
    });
  }
};

/* Update Vehicle Controller --> GET */
exports.updateVehicle = async (req, res) => {
  try {
    const errors = [];
    const vehicle_id = req.params.vehicle_id;
    const transporter_id = req.params.transporter_id;
    const transporter = await db.collection("users").doc(transporter_id);
    const getVehicle = await transporter
      .collection("vehicle_details")
      .doc(vehicle_id)
      .get();
    const data = await getVehicle.data();
    //const data = await db.collection("users").doc(id).get();
    if (data === undefined) {
      errors.push({ msg: "Vehicle not found...!!" });
      return res.render("Errors/errors", { errors: errors });
    }
    const vehicle = { id: data.id, vehicleData: data };
    return res.render("Vehicle/editVehicle", { id: data.id, vehicle: vehicle });
  } catch (error) {
    const errors = [];
    errors.push({ msg: error.message });
    return res.render("Errors/errors", { errors: errors });
  }
};
/* Update Vehicle Controller --> POST */
exports.updatedVehicle = async (req, res) => {
  try {
  
    const vehicle_id = req.params.vehicle_id;
    const transporter_id = req.params.transporter_id;
    const data = req.body;
    //  const { valid, errors } = validateTransporterData(data);

    // if (!valid) {
    //   if (errors.length > 0) {
    //     for (var i = 0; i <= errors.length; i++) {
    //       req.flash("error_msg", errors[i].msg);
    //       return res.redirect(`/transporter/updateTransporter/${id}`);
    //      }
    //   }
    // }
    const vehicleData = {
      vehicle_type: data.vehicleType,
      vehicle_number: data.vehicleNumber,
      comment: data.Comments,
      chassis_number: data.chassisNumber,
    };
    const transporter = await db.collection("users").doc(transporter_id);
    const getVehicle = await transporter
      .collection("vehicle_details")
      .doc(vehicle_id);
    await getVehicle.update(vehicleData);
    return res.redirect(`/transporter/${transporter_id}/details`);
  } catch (error) {
    const errors = [];
    errors.push({ msg: error.code });
    return res.render("Errors/errors", { errors: errors });
  }
};

// Change Vehicle Status Controller
exports.changeVehicleStatus = async (req, res) => {
  const errors = [];
  const transporter_id = req.params.transporter_id;
  const vehicle_id = req.params.vehicle_id;
  try {
    // console.log("HELLO YOU ARE IN CHANGE STATUS API OF VEHICLE");
    // console.log("DATA", req.body.reason);
    // console.log("Vehicle_id", vehicle_id);
    // console.log("Transporter_id", transporter_id);

    const transporter = await db.collection("users").doc(transporter_id);
    const getVehicle = await transporter
      .collection("vehicle_details")
      .doc(vehicle_id);
    const vehicle = await getVehicle.get();
    const data = await vehicle.data();
    if (data === undefined) {
      errors.push({ msg: "Vehicle not found...!!" });
      res.render("Errors/errors", { errors: errors });
    }

    const Status = {
      status: !data.status,
    };
    // console.log("Status", Status);

    const updateData = {
      type: "vehicle",
      id: await db.doc(
        "users/" + transporter_id + "/vehicle_details/" + vehicle_id
      ),
      user_id: await firebase.auth().currentUser.uid,
      updated_at: new Date(),
      status: Status.status,
      reason: req.body.reason,
    };

    // console.log("UPDATED DATA", updateData);

    await getVehicle.update(Status);

    await db.collection("status_logs").add(updateData);

    res.redirect("back");
  } catch (error) {
    console.log(error);
  }
};

// Delete Vehicle Controller
exports.removeVehicle = async (req, res) => {
  const transporter_id = req.params.transporter_id;
  const vehicle_id = req.params.vehicle_id;
  const errors = [];

  try {
    // console.log("HELLO YOU ARE IN DELETE API OF Vehicle");
    // console.log("DATA", req.body.reason);
    // console.log("TID", transporter_id);
    // console.log("VID", vehicle_id);

    const transporter = await db.collection("users").doc(transporter_id);
    const getVehicle = await transporter
      .collection("vehicle_details")
      .doc(vehicle_id);
    const vehicle = await getVehicle.get();
    const data = await vehicle.data();

    if (data === undefined) {
      errors.push({ msg: "Vehicle not found...!!" });
      res.render("Errors/errors", { errors: errors });
    }

    const updateData = {
      reason: req.body.reason,
      is_deleted: true,
      status: false,
    };

    const deletedData = {
      type: "vehicle",
      id: await db.doc(
        "users/" + transporter_id + "/vehicle_details/" + vehicle_id
      ),
      user_id: await firebase.auth().currentUser.uid,
      deleted_at: new Date(),
    };
    await getVehicle.update(updateData);

    await db.collection("deletion_logs").add(deletedData);

    res.redirect("back");
  } catch (error) {
    const errors = [];
    console.log(error);
    errors.push({ msg: error.message });
    return res.render("Errors/errors", {
      errors: errors,
    });
  }
};

// Vrify Vehicle Controller
exports.verifyVehicle = async (req, res) => {
  const transporter_id = req.params.transporter_id;
  const vehicle_id = req.params.vehicle_id;
  const errors = [];

  try {
    // console.log("HELLO YOU ARE IN Verify API OF Vehicle");
    // console.log("TID", transporter_id);
    // console.log("VID", vehicle_id);

    const transporter = await db.collection("users").doc(transporter_id);
    const getVehicle = await transporter
      .collection("vehicle_details")
      .doc(vehicle_id);
    const vehicle = await getVehicle.get();
    const data = await vehicle.data();

    if (data === undefined) {
      errors.push({ msg: "Vehicle not found...!!" });
      res.render("Errors/errors", { errors: errors });
    } else {
      let changeIsVerified = {};
      if (data.is_verified === "pending") {
        changeIsVerified = {
          is_verified: "verified",
        };
      }
      await getVehicle.update(changeIsVerified);
      res.redirect("back");
    }
  } catch (error) {
    const errors = [];
    console.log(error);
    errors.push({ msg: error.message });
    return res.render("Errors/errors", {
      errors: errors,
    });
  }
};
