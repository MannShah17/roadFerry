const { db, firebase, messaging } = require("../../config/admin");
const { sendAdminNotification } = require("../Notification/notification");
// const { validateDriverData } = require("./driverHelper");

// Get Driver's list of a perticular Transporter
// exports.transporterDriversList = async (req, res) => {
//   try {
//     const drivers = [];
//     const id = req.params.transporter_id;

//     const data = await db.collection("users").doc(id);
//     const getDrivers = await data.collection("driver_details").get();

//     getDrivers.forEach(async (doc) => {
//       if (doc.data().is_deleted === false) {
//         const driver = {
//           id: doc.id,
//           driverData: doc.data(),
//           transporter_id: id,
//         };
//         drivers.push(driver);
//       }
//     });
//     return res.render("Users/Driver/transporterDrivers", {
//       drivers: drivers,
//     });
//   } catch (error) {
//     const errors = [];
//     errors.push({ msg: error.message });
//     return res.render("Users/Transporter/displayTransporters", {
//       errors: errors,
//     });
//   }
// };

/* list of all drivers */

exports.listDrivers = async (req, res) => {
  try {
    const drivers = [];
    const id = req.params.transporter_id;

    // const data = await db.collection("users").doc();
    const getDrivers = await db.collection("users").orderBy('created_at', 'desc').get();

    // getDrivers.forEach((doc) => {
    //    if (
    //     (doc.data().user_type == "driver" && doc.data().is_deleted == false)
        
    //   ) {
    //     drivers.push(doc.data());
    //   }
    // });
    getDrivers.forEach(async (doc) => {
      if ((doc.data().user_type == "driver"  && doc.data().is_deleted == false)) {
        const driver = {
          id: doc.id,
          driverData: doc.data(),
          transporter_id: doc.data()["transporter_uid"],
        };

        drivers.push(driver);
      }

    });
    // console.log(drivers,"driverlist")
    return res.render("Users/Driver/displayDrivers", {
      drivers: drivers,
    });
  } catch (error) {
    const errors = [];
    errors.push({ msg: error.message });
    return res.render("Users/Driver/displayDrivers", {
      errors: errors,
    });
  }
};
exports.dDetails = async (req, res) => {
  
  const transporter_id = req.params.transporter_id;
  const driver_id = req.params.id;
  // console.log(transporter_id,driver_id,"...........................")
  const errors = [];
  let driver = {};
  try {
    if (transporter_id !== driver_id) {
      // const user = await db.collection("users").doc(driver_id);
      // const driverData = await user.get();
      // const data = await driverData.data();
      const user = await db.collection("users").doc(driver_id);
      const driverData = await user.get();
      const data = await driverData.data();
      // const drivers = await transporter.collection("driver_details");
      // const driversData = await drivers.get();
      // let id = null;
      // driversData.forEach((doc) => {
      //   if (driver_id == doc.data().user_uid) {
      //     id = doc.id;
      //   }
      // });
      // const getDriver = await drivers.doc(id).get();
      // const data = await getDriver.data();

      if (data === undefined) {
        errors.push({ msg: "Driver not found...!!" });
        return res.render("Errors/errors", {
          errors: errors,
        });
      }

      driver = {
        id: driver_id,
        driverData: data,
        transporterId: transporter_id,
      };
      
    } else {
      const transporter = await db.collection("users").doc(transporter_id);
      const drivers = await transporter.collection("driver_details");
      const driversData = await drivers.get();
      let id = null;
      driversData.forEach((doc) => {
        if (driver_id == doc.data().user_uid) {
          id = doc.id;
        }
      });
      const getDriver = await drivers.doc(id).get();
      const data = await getDriver.data();
      driver = {
        id: driver_id,
        driverData: data,
        transporterId: transporter_id,
      };
      // console.log("DRIVER DETAILS*************", driver);
    }
    return res.render("Users/Driver/driverDetails", {
      driver: driver,
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
/* update driver test*/
exports.up = async (req, res) => {
  
  const transporter_id = req.params.transporter_id;
  const driver_id = req.params.driver_id;
  const errors = [];
  let driver = {};
  try {
    if (transporter_id !== driver_id) {
      // const transporter = await db.collection("users").doc(transporter_id);
      // const drivers = await transporter.collection("driver_details");
      // const driversData = await drivers.get();
      // let id = null;
      // driversData.forEach((doc) => {
      //   if (driver_id == doc.data().user_uid) {
      //     id = doc.id;
      //   }
      // });
      // const getDriver = await drivers.doc(id).get();
      // const data = await getDriver.data();
      // driver = {
      //   id: driver_id,
      //   driverData: data,
      //   transporterId: transporter_id,
      // };
      const user = await db.collection("users").doc(driver_id);
      const driverData = await user.get();
      const data = await driverData.data();
      // console.log(data,"data1")
      if (data === undefined) {
        errors.push({ msg: "Driver not found...!!" });
        return res.render("Errors/errors", {
          errors: errors,
        });
      }

      driver = {
        id: driver_id,
        driverData: data,
        transporterId: transporter_id,
      };
      
    } else {
      const transporter = await db.collection("users").doc(transporter_id);
      const drivers = await transporter.collection("driver_details");
      const driversData = await drivers.get();
      let id = null;
      driversData.forEach((doc) => {
        if (driver_id == doc.data().user_uid) {
          id = doc.id;
        }
      });
      const getDriver = await drivers.doc(id).get();
      const data = await getDriver.data();
      driver = {
        id: driver_id,
        driverData: data,
        transporterId: transporter_id,
      };
      // console.log("DRIVER DETAILS*************", driver);
    }
    return res.render("Driver/editDriver", {
      driver: driver,
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
/* upd Driver test */
exports.updDriver = async (req, res) => {
  try {
  const driver_id = req.params.driver_id;
  const transporter_id = req.params.transporter_id;

console.log(transporter_id,driver_id,"...........id....")

  const da = req.body;
  const updateData = {
    first_name: da.firstname,
    last_name: da.lastname,
    email: da.email,
    phone_number: da.phone,
    age: da.age,
    // address_proof: addressProofPublicUrl,
    // identity_proof: identityProofPublicUrl,
    // created_at: new Date(),
    // driver_photo: profilePublicUrl,
  };
  const transporter = await db.collection("users").doc(driver_id);
  // const getDriver = await transporter
  //   .collection("driver_details")
  //   .doc(transporter_id)
    await transporter.update(updateData);
  // TODO : Checking 

  // const tr = await db.collection("users").doc(transporter_id);
  // const dt = await tr
  //   .collection("driver_details")
  //   .where("user_uid","==",driver_id)
  //   .then((res)=>{
  //     console.log("....loading")
  //   })

    const tr = await db.collection("users").doc(transporter_id);
    const dt = await tr.collection("driver_details");
    const dd = await dt.get();

    let id = null;
    dd.forEach((doc)=>{
      if (driver_id == doc.data().user_uid) {
        id = doc.id;
      }
    })
  const fd = await dt.doc(id);
  // const final = await fd.data();
            await  fd.update(updateData)
            console.log("done")
            //  console.log(final,"dt./././././././././././.")
    // await dt.update(updateData)
 
      // console.log( transporter,"................ get driver..............")
    return res.redirect(`/driver/${transporter_id}/update/${driver_id}`);

  } catch (error) {
    return res.redirect("back");
  }

}

/* Update Driver Controller --> GET */
exports.updateDriver = async (req, res) => {
  try {
    const errors = [];
    const driver_id = req.params.driver_id;
    const transporter_id = req.params.transporter_id;
    const transporter = await db.collection("users").doc(transporter_id);
    const getDriver = await transporter
      .collection("driver_details")
      .doc(driver_id)
      .get();
    const data = await getDriver.data();
    //const data = await db.collection("users").doc(id).get();
    if (data === undefined) {
      errors.push({ msg: "Driver not found...!!" });
      return res.render("Errors/errors", { errors: errors });
    }
    //const vehicle = { id: data.id, vehicleData: data };
    const driver = {
      id: driver_id,
      driverData: data,
      transporterId: transporter_id,
    };
    console.log(driver.driverData.user_uid,"consolecheck")
    return res.render("Users/Driver/editDriver", { driver: driver });
  } catch (error) {
    const errors = [];
    errors.push({ msg: error.message });
    return res.render("Errors/errors", { errors: errors });
  }
};
/* Update Driver Controller --> POST */
exports.updatedDriver = async (req, res) => {
  try {
  
    const driver_id = req.params.driver_id;
    const transporter_id = req.params.transporter_id;
    const data = req.body;
   console.log(data,"datauser_uid??????????????")
    //  const { valid, errors } = validateTransporterData(data);

    // if (!valid) {
    //   if (errors.length > 0) {
    //     for (var i = 0; i <= errors.length; i++) {
    //       req.flash("error_msg", errors[i].msg);
    //       return res.redirect(`/transporter/updateTransporter/${id}`);
    //      }
    //   }
    // }
    const driverData = {
      first_name: data.firstname,
      last_name: data.lastname,
      email: data.email,
      phone_number: data.phone,
      age: data.age,
      // user_uid:data.user_uid
      // address_proof: addressProofPublicUrl,
      // identity_proof: identityProofPublicUrl,
      // created_at: new Date(),
      // driver_photo: profilePublicUrl,
    };
    // const tr = await db.collection("user").doc(driver_id);
    // await tr.update(driverData)
   if(transporter_id == data.uid){
     const trp = await db.collection("users").doc(transporter_id);
     const drp = await trp
     .collection("driver_details")
     .doc(driver_id);
     await drp.update(driverData);

   }else{
    const tr = await db.collection("users").doc(data.uid);
    await tr.update(driverData)
  }
    const transporter = await db.collection("users").doc(transporter_id);
    const getDriver = await transporter
      .collection("driver_details")
      .doc(driver_id);
    await getDriver.update(driverData);
    return res.redirect(`/transporter/${transporter_id}/details`);
  } catch (error) {
    const errors = [];
    errors.push({ msg: error.code });
    return res.render("Errors/errors", { errors: errors });
  }
};

// Get driver details
exports.driverDetails = async (req, res) => {
  const transporter_id = req.params.transporter_id;
  const driver_id = req.params.driver_id;
  console.log("call",driver_id)
  const errors = [];
  let driver = {};
  try {
    if (transporter_id !== driver_id) {
      const user = await db.collection("users").doc(driver_id);
      const driverData = await user.get();
      const data = await driverData.data();
console.log(data,"this is data...")
      if (data === undefined) {
        errors.push({ msg: "Driver not found...!!" });
        return res.render("Errors/errors", {
          errors: errors,
        });
      }

      driver = {
        id: driver_id,
        driverData: data,
        transporterId: transporter_id,
      };
      // console.log("DRIVER DETAILS*************", driver);
    } else {
      const transporter = await db.collection("users").doc(transporter_id);
      const drivers = await transporter.collection("driver_details");
      const driversData = await drivers.get();
      let id = null;
      driversData.forEach((doc) => {
        if (driver_id == doc.data().user_uid) {
          id = doc.id;
        }
      });
      const getDriver = await drivers.doc(id).get();
      const data = await getDriver.data();
      console.log(data,"same id data")
      driver = {
        id: driver_id,
        driverData: data,
        transporterId: transporter_id,
      };
      console.log("DRIVER DETAILS*************", driver);
    }

    return res.render("Users/Driver/driverDetails", {
      driver: driver,
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

// Change Driver Status Controller
exports.changeDriverStatus = async (req, res) => {
  const errors = [];
  const transporter_id = req.params.transporter_id;
  const driver_id = req.params.driver_id;
  try {
    // console.log("HELLO YOU ARE IN CHANGE STATUS API OF DRIVER");
    // console.log("DATA", req.body.reason);
    // console.log("Driver_id", driver_id);
    // console.log("Transporter_id", transporter_id);

    const user = await db.collection("users").doc(driver_id);
    const data = await user.get();
    const driverData = await data.data();

    if (driverData === undefined) {
      errors.push({ msg: "Driver not found...!!" });
      res.render("Errors/errors", { errors: errors });
    }

    const Status = {
      status: !driverData.status,
    };
    // console.log("Status", Status);

    const updateData = {
      type: "users",
      id: await db.doc("users/" + driver_id),
      user_id: await firebase.auth().currentUser.uid,
      updated_at: new Date(),
      status: Status.status,
      reason: req.body.reason,
    };

    // console.log("UPDATED DATA", updateData);
    // await firebase.auth().updateUser(id, { disabled: true });
    // await firebaseAdmin
    //   .auth()
    //   .updateUser(id, { disabled: true })
    //   .then((userRecord) => {
    //     // See the UserRecord reference doc for the contents of userRecord.
    //     console.log("Successfully updated user", userRecord.toJSON());
    //   })
    //   .catch((error) => {
    //     console.log("Error updating user:", error);
    //   });

    await user.update(Status);

    const transporter = await db.collection("users").doc(transporter_id);
    const getDrivers = await transporter.collection("driver_details").get();

    let id = null;
    getDrivers.forEach((doc) => {
      if (driver_id == doc.data().user_uid) {
        id = doc.id;
      }
    });
    const getDriverId = await transporter.collection("driver_details").doc(id);
    await getDriverId.update(Status);

    await db.collection("status_logs").add(updateData);

    res.redirect("back");
    // return true;
    // return res.redirect(`driver/${transporter_id}/displayDrivers`);
  } catch (error) {
    console.log(error);
    return res.redirect("back");
  }
};

// Change Driver Status API
// exports.changeDriverStatus = async (req, res) => {
//   const errors = [];
//   const transporter_id = req.params.transporter_id;
//   const driver_id = req.params.driver_id;
//   let updateData = {};
//   try {
//     // console.log("HELLO YOU ARE IN CHANGE STATUS API OF DRIVER");
//     // console.log("DATA", req.body.reason);
//     // console.log("Driver_id", driver_id);
//     // console.log("Transporter_id", transporter_id);

//     const transporter = await db.collection("users").doc(transporter_id);
//     const getDrivers = await transporter.collection("driver_details").get();

//     let id = null;
//     getDrivers.forEach((doc) => {
//       if (driver_id == doc.data().user_uid) {
//         id = doc.id;
//       }
//     });
//     const getDriverId = await transporter.collection("driver_details").doc(id);

//     if (transporter_id !== driver_id) {
//       const user = await db.collection("users").doc(driver_id);
//       const data = await user.get();
//       const driverData = await data.data();

//       if (driverData === undefined) {
//         errors.push({ msg: "Driver not found...!!" });
//         res.render("Errors/errors", { errors: errors });
//       }

//       const Status = {
//         status: !driverData.status,
//       };
//       // console.log("Status", Status);

//       updateData = {
//         type: "users",
//         id: await db.doc("users/" + driver_id),
//         user_id: await firebase.auth().currentUser.uid,
//         updated_at: new Date(),
//         status: Status.status,
//         reason: req.body.reason,
//       };

//       // console.log("UPDATED DATA", updateData);
//       // await firebase.auth().updateUser(id, { disabled: true });
//       // await firebaseAdmin
//       //   .auth()
//       //   .updateUser(id, { disabled: true })
//       //   .then((userRecord) => {
//       //     // See the UserRecord reference doc for the contents of userRecord.
//       //     console.log("Successfully updated user", userRecord.toJSON());
//       //   })
//       //   .catch((error) => {
//       //     console.log("Error updating user:", error);
//       //   });

//       await user.update(Status);

//       await getDriverId.update(Status);
//     } else {
//       const getDriverData = await getDriverId.get();
//       const data = await getDriverData.data();
//       const Status = {
//         status: !data.status,
//       };
//       // console.log("Status", Status);

//       updateData = {
//         type: "users",
//         id: await db.doc("users/" + transporter_id + "/driver_details/" + id),
//         user_id: await firebase.auth().currentUser.uid,
//         updated_at: new Date(),
//         status: Status.status,
//         reason: req.body.reason,
//       };

//       await getDriverId.update(Status);
//     }

//     await db.collection("status_logs").add(updateData);

//     return res.redirect("back");
//     // res.redirect(`/transporter/transporterDetails/${transporter_id}`);
//     // return true;
//     // return res.redirect(`driver/${transporter_id}/displayDrivers`);
//   } catch (error) {
//     console.log(error);
//   }
// };

/*  Delete Driver Controller */
exports.removeDriver = async (req, res) => {
  const transporter_id = req.params.transporter_id;
  const driver_id = req.params.driver_id;
  const errors = [];

  try {
    // const transporter_id = req.params.transporter_id;
    // const driver_id = req.params.driver_id;
    console.log("HELLO YOU ARE IN DELETE API OF TRANSPORTER");
    console.log("DATA", req.body);
    console.log("ID", driver_id);
    console.log("ID", transporter_id);

    const user = await db.collection("users").doc(driver_id);
    const data = await user.get();
    const driverData = await data.data();

    if (driverData === undefined) {
      errors.push({ msg: "Driver not found...!!" });
      res.render("Errors/errors", { errors: errors });
    }

    const updateData = {
      reason: req.body.reason,
      is_deleted: true,
      status: false,
    };

    const deletedData = {
      type: "users",
      id: await db.doc("users/" + driver_id),
      // user_id: await firebase.auth().currentUser.uid,
      deleted_at: new Date(),
    };
    /** Change the IDs whenevern required */
    // await firebase.auth().updateUser(id, { disabled: true });
    // await firebaseAdmin
    //   .auth()
    //   .updateUser(id, { disabled: true })
    //   .then((userRecord) => {
    //     // See the UserRecord reference doc for the contents of userRecord.
    //     console.log("Successfully updated user", userRecord.toJSON());
    //   })
    //   .catch((error) => {
    //     console.log("Error updating user:", error);
    //   });
    await user.update(updateData);

    const transporter = await db.collection("users").doc(transporter_id);
    const getDrivers = await transporter.collection("driver_details").get();

    let id = null;
    getDrivers.forEach((doc) => {
      if (driver_id == doc.data().user_uid) {
        id = doc.id;
      }
    });
    const getDriverId = await transporter.collection("driver_details").doc(id);
    await getDriverId.update(updateData);

    await db.collection("deletion_logs").add(deletedData);

    return res.redirect("back");
    // res.redirect(`/transporter/transporterDetails/${transporter_id}`);
  } catch (error) {
    console.log(error);
    return res.redirect("back");
    // const errors = [];
    // errors.push({ msg: error.message });
    // return res.render("Errors/errors", {
    //   errors: errors,
    // });
  }
};

// Vrify Driver Controller
exports.verifyDriver = async (req, res) => {
  const transporter_id = req.params.transporter_id;
  const driver_id = req.params.driver_id;
  const errors = [];

  try {
    // console.log("HELLO YOU ARE IN Verify API OF Driver");
    // console.log("TID", transporter_id);
    // console.log("DID", driver_id);

    const transporter = await db.collection("users").doc(transporter_id);

    const getDrivers = await transporter.collection("driver_details").get();

    let id = null;
    getDrivers.forEach((doc) => {
      if (driver_id == doc.data().user_uid) {
        id = doc.id;
      }
    });
    const getDriverId = await transporter.collection("driver_details").doc(id);

    if (transporter_id === driver_id) {
      await getDriverId.update({
        is_verified: "verified",
      });
    } else {
      const user = await db.collection("users").doc(driver_id);
      const data = await user.get();
      const driverData = await data.data();

      if (driverData === undefined) {
        errors.push({ msg: "Driver not found...!!" });
        res.render("Errors/errors", { errors: errors });
      } else {
        let updateData = {};
        if (driverData.is_verified === "pending") {
          updateData = {
            is_verified: "verified",
          };
        }

        await user.update(updateData);

        await getDriverId.update(updateData);
      }
    }
    await transporter.update({ is_request: true });

    await sendAdminNotification(transporter_id, driver_id, "verified");

    // return res.redirect("back");
    return res.redirect(`/transporter/${transporter_id}/details`);
  } catch (error) {
    const errors = [];
    console.log(error);
    errors.push({ msg: error.message });
    return res.render("Errors/errors", {
      errors: errors,
    });
  }
};

// Reject Driver Controller
exports.rejectDriver = async (req, res) => {
  const transporter_id = req.params.transporter_id;
  const driver_id = req.params.driver_id;
  const errors = [];

  try {
    // console.log("HELLO YOU ARE IN Verify API OF Driver");
    // console.log("TID", transporter_id);
    // console.log("DID", driver_id);

    const transporter = await db.collection("users").doc(transporter_id);

    const getDrivers = await transporter.collection("driver_details").get();

    let id = null;
    getDrivers.forEach((doc) => {
      if (driver_id == doc.data().user_uid) {
        id = doc.id;
      }
    });
    const getDriverId = await transporter.collection("driver_details").doc(id);

    if (transporter_id === driver_id) {
      await getDriverId.update({
        is_verified: "rejected",
      });
    } else {
      const user = await db.collection("users").doc(driver_id);
      const data = await user.get();
      const driverData = await data.data();

      if (driverData === undefined) {
        errors.push({ msg: "Driver not found...!!" });
        res.render("Errors/errors", { errors: errors });
      } else {
        let updateData = {};
        if (driverData.is_verified === "pending") {
          updateData = {
            is_verified: "rejected",
          };
        }

        await user.update(updateData);

        await getDriverId.update(updateData);
      }
    }
    // await transporter.update({ is_request: true });

    await sendAdminNotification(transporter_id, driver_id, "rejected");

    // return res.redirect("back");
    return res.redirect(`/transporter/${transporter_id}/details`);
  } catch (error) {
    const errors = [];
    console.log(error);
    errors.push({ msg: error.message });
    return res.render("Errors/errors", {
      errors: errors,
    });
  }
};

/*
  Add New Driver
*/
// exports.newDriver = async (req, res) => {
//   try {
//     // Getting transporter's ID from url
//     const transpoterId = req.params.transporter_id;

//     // Getting driver's data from the UI
//     const data = {
//       email: req.body.email,
//       firstname: req.body.firstname,
//       lastname: req.body.lastname,
//       phone: req.body.phone,
//       address: req.body.address,
//       area: req.body.area,
//       city: req.body.city,
//       pincode: req.body.pincode,
//       state: req.body.state,
//       country: req.body.country,
//       documentType: req.body.documentType,
//       status: req.body.status,
//     };

//     // Checking Validations errors
//     const { valid, errors } = validateDriverData(data);

//     if (!valid) {
//       return res.status(400).json(errors);
//     }

//     // Converting status type from String to  Boolean
//     let status = null;
//     if (data.status == "true") {
//       status = Boolean(!!data.status);
//     } else {
//       status = Boolean(!data.status);
//     }

//     // Setting driver's data into objects
//     const driverData = {
//       first_name: data.firstname,
//       last_name: data.lastname,
//       email: data.email,
//       phone_number: data.phone,
//       user_type: "Driver",
//       status: status,
//       created_at: new Date(),
//     };

//     const address = {
//       flatNumber: data.address,
//       area: data.area,
//       city: data.city,
//       pincode: data.pincode,
//       state: data.state,
//       country: data.country,
//       // title: data.city,
//     };

//     // Storing Driver's data into firestore
//     const transpoter = await db.collection("users").doc(transpoterId);
//     const driver = await transpoter.collection("driver_details").doc();

//     await driver.set(driverData);
//     await driver.collection("address").doc().set(address);
//     await driver
//       .collection("documents")
//       .doc()
//       .set({ type: data.documentType, url: "", updated_at: new Date() });

//     // Rendering add Driver's UI
//     res.render("Users/Driver/addDriver", {
//       message: "Driver is created...!!",
//     });
//   } catch (error) {
//     // Rendering Errors
//     return res.render({ error: error.code });
//   }
// };
