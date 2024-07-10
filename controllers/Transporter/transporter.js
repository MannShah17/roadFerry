const fetchdata = require('node-fetch');
require("dotenv").config();
//const { getAuth, signInWithPhoneNumber } = require("firebase/firebase-auth");
const { v4: uuidv4 } = require('uuid');
const {
  db,
  firebaseSecondaryApp,
  firebase,
  getAuth,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  bucket,
} = require("../../config/admin");
const {
  validateTransporterData,
  validateTransporterDocuments,
} = require("./transporterHelper");

/**Function to get public URL of a Image */
const imagePublicUrl = async (file) => {
  let urls = [];
  let publicUrl;

  if (file.length === 1) {
    const filename =
      file[0].fieldname + "-" + Date.now() + "-" + file[0].originalname;
    let blob = await bucket.file(filename);

    const blobWriter = blob.createWriteStream({
      metadata: {
        contentType: file[0].mimetype,
      },
    });

    blobWriter.on("finish", async () => {
      console.log("Image Uploaded...!!");
    });
    blobWriter.end(file[0].buffer);

    publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name
      }/o/${encodeURI(blob.name)}?alt=media`;

    return publicUrl;
  } else if (file.length > 1) {
    let blobWriter;
    for (let i = 0; i < file.length; i++) {
      const filename =
        file[i].fieldname + "-" + Date.now() + "-" + file[i].originalname;
      let blob = await bucket.file(filename);
      blobWriter = blob.createWriteStream({
        metadata: {
          contentType: file[i].mimetype,
        },
      });

      blobWriter.on("finish", async () => {
        console.log("Image Uploaded...!!");
      });
      blobWriter.end(file[i].buffer);

      publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name
        }/o/${encodeURI(blob.name)}?alt=media`;
      urls.push(publicUrl);
    }
    return urls;
  }
};

/* Function to get Lat-Long */
// const getLatLong = async (address) => {
//   var geocoder = NodeGeocoder({
//     // provider: process.env.GEO_PROVIDER,
//     provider: "opencage",
//     // apiKey: process.env.GEO_API_KEY,
//     apiKey: "6a6bca1dc71e4877b61d1a38ea7f46db",
//   });

//   // const res = await geocoder.geocode("Rajasthan 302029");
//   // const res = await geocoder.geocode("andheri east mumbai 400069");
//   const res = await geocoder.geocode(address);

//   let max = 0;
//   let latitude = null;
//   let longitude = null;
//   let coordinates = {};

//   if (res.length > 1) {
//     for (var i = 0; i < res.length; i++) {
//       if (res[i].extra.confidence > max) {
//         max = res[i].extra.confidence;
//         latitude = res[i].latitude;
//         longitude = res[i].longitude;
//       }
//     }
//     coordinates = {
//       latitude: latitude,
//       longitude: longitude,
//     };
//   } else {
//     coordinates = {
//       latitude: res[0].latitude,
//       longitude: res[0].longitude,
//     };
//   }
//   return coordinates;
// };

/* Function to convert into boolean */
const isBoolean = async (string) => {
  let boolean = null;
  if (string == "true") {
    boolean = Boolean(!!string);
  } else {
    boolean = Boolean(!string);
  }
  return boolean;
};

/* Create a new Transporter Controller --> GET */
exports.getNewTransporter = async (req, res) => {
  const vehicleTypes = [];
  const data = await db.collection("vehicles").get();
  data.forEach((doc) => {
    // const vehicleType = { id: doc.id, vehicleTypeData: doc.data() };
    vehicleTypes.push(doc.data().vehicle_type);
  });
  try {
    return res.render("Users/Transporter/addTransporter", {
      vehicleTypes: vehicleTypes,
    });
  } catch (error) {
    const errors = [];
    errors.push({ msg: error.message });
    // return res.render("Errors/errors", { errors: errors });
    return res.render("Users/Transporter/addTransporter", {
      errors: errors,
      vehicleTypes: vehicleTypes,
    });
  }
};

/* Add a new Transporter Controller --> POST */
exports.addTransporter = async (req, res) => {
  const vehicleTypes = [];
  const data = await db.collection("vehicles").get();
  data.forEach((doc) => {
    // const vehicleType = { id: doc.id, vehicleTypeData: doc.data() };
    vehicleTypes.push(doc.data().vehicle_type);
  });
  try {
    const data = req.body;
    // console.log("***************", data);

    const files = req.files;
    // console.log("***************", files);

    /**Add document type whenever its required. It is not added yet. */
    const { valid, errors } = validateTransporterData(data);
    const { fileValid, fileErrors } = validateTransporterDocuments(files);
    if (!fileValid || !valid) {
      return res.render("Users/Transporter/addTransporter", {
        vehicleTypes: vehicleTypes,
        fileErrors,
        errors,
      });
    } else {
      const address = {
        area: data.area,
        city: data.city,
        pincode: data.pincode,
      };
      // const stringAddress = JSON.stringify(Object.values(address));
      //const latLong = await getLatLong(stringAddress);

      let status = await isBoolean(data.status);
      // let registered = await isBoolean(data.registered);
      const profilePublicUrl = await imagePublicUrl(files.profile);
      const addressProofPublicUrl = await imagePublicUrl(files.AddressProof);
      const identityProofPublicUrl = await imagePublicUrl(files.IdentityProof);
      const icons = await imagePublicUrl(files.icons);

      let transporterData = {
        first_name: data.firstname,
        last_name: data.lastname,
        email: data.email,
        phone_number: data.phone,
        country_code: "+91",
        user_type: "transporter",
        register_number: data.registerNo,
        is_verified: "pending",
        gst_number: data.gstNo,
        status: status,
        // registered: registered,
        registered: true,
        is_deleted: false,
        reason: "",
        created_at: new Date(),
        priority: 0,
        is_request: false,
        driver_count: 1,
        address: {
          coordinates: 5.565656,
          flat_number: data.address,
          area: data.area,
          city: data.city,
          pincode: data.pincode,
          state: data.state,
          country: data.country,
          // title: data.city,
        },
      };

      let driverData = {
        first_name: data.FirstName,
        last_name: data.LastName,
        email: data.Email,
        phone_number: data.Phone,
        country_code: "+91",
        // user_type: "transporter",
        age: data.Age,
        address_proof: addressProofPublicUrl,
        identity_proof: identityProofPublicUrl,
        created_at: new Date(),
        driver_photo: profilePublicUrl,
        is_assign: false,
        is_deleted: false,
        is_verified: "pending",
        status: status,
        // user_uid: newTransporter.user.uid,
      };
      // console.log(req.files,"req files*****");
      // let iconss = [];
      // for (var i = 0; i < req.files.length; i++) {
      //   console.log(req.files,"req files1****");
      //   const iconId = uuidv4();
      //   let base64 = req.files[i].buffer.toString("base64");
      //   let mimetype = req.files[i].mimetype;
      //   const nameArr = req.files[i].originalname.split(".")
      //   const fileLocation = `vehicle-details/${iconId}.${(nameArr.length !== 0) ? nameArr[nameArr.length - 1] : ""}`
      //   const file = bucket.file(fileLocation)
      //   await file.save(req.files[i].buffer, { contentType: mimetype })
      //   await file.setMetadata({
      //     firebaseStorageDownloadTokens: iconId
      //   })

      //   const icon = {
      //     id: iconId,
      //     base64: base64,
      //     dataUrl: `data:${mimetype};${base64}`,
      //     url: `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(fileLocation)}?alt=media&token=${iconId}`,
      //     type: mimetype,
      //   };
      //   iconss.push(icon);
      // }

      const vehicleData = {
        vehicle_type: data.vehicleTypeName,
        vehicle_number: data.VehicleNumber,
        comment: data.Comments,
        chassis_number: data.ChassisNumber,
        vehicle_photos: typeof icons === "string" ? [icons] : icons,
        created_at: new Date(),
        is_assign: false,
        is_deleted: false,
        is_verified: "pending",
        status: status,
        //vehicle_photos: icons,
      };

      const notification = {
        // type: req.body.type,
        type: "new_driver",
        is_read: false,
        text: `${transporterData.first_name} ${transporterData.last_name} has added ${driverData.first_name} ${driverData.last_name} to his profile, please verify its details at earliest.`,
        created_at: new Date(),
        // user_id: userId,
        title: "New Driver Added",
        // orderId: orderId,
      };

      const newTransporter = await firebaseSecondaryApp
        .auth()
        .createUserWithEmailAndPassword(data.email, data.password);
      // const newTransporters = await firebaseSecondaryApp
      //   .auth()
      //   .createUser({ 
      //   phone_number: data.phone,
      //   password:data.password,
      // });
      // console.log(newTransporters);

      let transporter = await db
        .collection("users")
        .doc(newTransporter.user.uid);
      await transporter.set(transporterData);

      const vehicle = await transporter.collection("vehicle_details").doc();
      await vehicle.set(vehicleData);

      let transporterDriverData = {};
      let newDriverData = {};

      if (data.TransporterAsDriver === "checked") {
        transporterDriverData = {
          ...driverData,
          user_uid: newTransporter.user.uid,
        };

        const transporterDriver = await transporter
          .collection("driver_details")
          .doc();
        await transporterDriver.set(transporterDriverData);
      } else {
        let driverPassword = Math.random().toString(36).slice(-8);

        const newDriver = await firebaseSecondaryApp
          .auth()
          .createUserWithEmailAndPassword(data.Email, driverPassword);

        transporterDriverData = {
          ...driverData,
          temp_password: driverPassword,
          user_uid: newDriver.user.uid,
        };

        newDriverData = {
          ...driverData,
          temp_password: driverPassword,
          transporter_uid: newTransporter.user.uid,
          user_type: "driver",
        };

        let driver = await db.collection("users").doc(newDriver.user.uid);
        await driver.set(newDriverData);

        const transporterDriver = await transporter
          .collection("driver_details")
          .doc();
        await transporterDriver.set(transporterDriverData);

        firebaseSecondaryApp.auth().signOut();
      }

      firebaseSecondaryApp.auth().signOut();

      await db.collection("notification").add(notification);

      const getAllUsers = await db.collection("users");
      const getUsers = await getAllUsers.get();
      getUsers.forEach(async (user) => {
        if (
          user.data().user_type === "admin" ||
          user.data().user_type === "Admin"
        ) {
          await getAllUsers
            .doc(user.id)
            .update({ noti_count: user.data().noti_count + 1 });
        }
      });

      return res.render("Users/Transporter/addTransporter", {
        message: "Transporter is created...!!",
        vehicleTypes: vehicleTypes,
      });

      // const address = {
      //   flatNumber: data.address,
      //   area: data.area,
      //   city: data.city,
      //   pincode: data.pincode,
      //   state: data.state,
      //   country: data.country,
      //   // title: data.city,
      // };

      // await db
      //   .collection("users")
      //   .doc(newTransporter.user.uid)
      //   .collection("address")
      //   .add(address);

      // const transporter = await db.collection("users").doc();
      // await transporter.set(transporterData);

      // await db
      //   .collection("users")
      //   .doc(transporter.id)
      //   .collection("address")
      //   .add(address);
    }
    // return res.redirect("/transporter/createTransporter");
  } catch (error) {
    const errors = [];
    if (error.code == "auth/email-already-in-use") {
      errors.push({ msg: "Email already exists!" });
      return res.render("Users/Transporter/addTransporter", {
        vehicleTypes: vehicleTypes,
        errors,
      });
    }
    errors.push({ msg: error.message });
    return res.render("Users/Transporter/addTransporter", {
      vehicleTypes: vehicleTypes,
      errors,
    });
  }
};

/* Create a new Transporter Controller --> POST */
exports.newTransporter = async (req, res) => {
  console.log("api called")
  console.log(req.body);
  const vehicleTypes = [];
  let coordinates;
  let newcoordinate;
  var API_KEY = process.env.GOOGLE_MAP_API
  var BASE_URL = "https://maps.googleapis.com/maps/api/geocode/json?address=";
  var address = req.body.address + "," + req.body.area + "," + req.body.city + "," + req.body.state + "," + req.body.country;
  var url = BASE_URL + address + "&key=" + API_KEY;
  const geoData = await fetchdata(url)
  const geoJson = await geoData.json()
  coordinates = geoJson.results.length !== 0 ? geoJson.results[0].geometry.location : ""
  console.log(coordinates);
  newcoordinate = {
    latitude: coordinates.lat ? coordinates.lat.toFixed(6) : coordinates.latitude ? coordinates.latitude.toFixed(6) : 0,
    longitude: coordinates.lng ? coordinates.lng.toFixed(6) : coordinates.longitude ? coordinates.longitude.toFixed(6) : 0
  }
  //   .then(res => res.json())
  //   .then(json => {
  //       console.log("data");
  //       console.log(json.results[0]);
  //       coordinates = json.results[0].geometry.location;
  //       console.log(latitude,"lat")
  //     //  console.log(latitude,"latitude")
  // })
  const data = await db.collection("vehicles").get();
  data.forEach((doc) => {
    // const vehicleType = { id: doc.id, vehicleTypeData: doc.data() };
    vehicleTypes.push(doc.data().vehicle_type);
  });
  try {
    const data = req.body;
    // console.log("***************", data);

    const files = req.files;
    // console.log("***************", files);

    /**Add document type whenever its required. It is not added yet. */
    const { valid, errors } = validateTransporterData(data);
    const { fileValid, fileErrors } = validateTransporterDocuments(files);
    if (!fileValid || !valid) {
      console.log(errors)
      return res.status(400).send({
        data: {},
        message: errors
      })
      // return res.status(400).render("Users/Transporter/addTransporter", {
      //   vehicleTypes: vehicleTypes,
      //   fileErrors,
      //   errors,
      // });
    } else {
      const address = {
        area: data.area,
        city: data.city,
        pincode: data.pincode,
      };
      // const stringAddress = JSON.stringify(Object.values(address));
      //const latLong = await getLatLong(stringAddress);

      let status = await isBoolean(data.status);
      // let registered = await isBoolean(data.registered);
      const profilePublicUrl = await imagePublicUrl(files.profile);
      const addressProofPublicUrl = await imagePublicUrl(files.AddressProof);
      const identityProofPublicUrl = await imagePublicUrl(files.IdentityProof);
      const icons = await imagePublicUrl(files.icons)
      let tad = false
      if (data.check === "checked") {
        tad = true;
      } else {
        tad = false;
      }
      let trpassword = Math.random().toString(36).slice(-8);
      const newTransporter = await firebaseSecondaryApp
        .auth()
        .createUserWithEmailAndPassword(data.email + trpassword, trpassword);

      let driverAstransporterData = {
        access_token: "",
        first_name: data.firstname,
        last_name: data.lastname,
        email: data.email,
        phone_number: data.phone,
        country_code: "+91",
        user_type: "transporter",
        register_number: data.registerNo,
        is_verified: "pending",
        gst_number: data.gstNo,
        status: status,
        transporter_as_driver: tad,
        is_deleted: false,
        reason: "",
        created_at: new Date(),
        priority: 1,
        driver_count: 1,
        address: {
          coordinates: newcoordinate,
          flat_number: data.address,
          area: data.area,
          city: data.city,
          pincode: data.pincode,
          state: data.state,
          country: data.country,
        },
        address_proof: addressProofPublicUrl,
        age: data.Age,
        completed_step_index: -1,
        driver_photo: profilePublicUrl,
        fcm_token: "",
        identify_proof: identityProofPublicUrl,
        is_registered: true,
        is_request: true,
      };
      let transporterData = {
        access_token: "",
        first_name: data.firstname,
        last_name: data.lastname,
        email: data.email,
        phone_number: data.phone,
        country_code: "+91",
        user_type: "transporter",
        register_number: data.registerNo,
        is_verified: "pending",
        gst_number: data.gstNo,
        status: status,
        transporter_as_driver: tad,
        is_deleted: false,
        reason: "",
        created_at: new Date(),
        priority: 1,
        driver_count: 1,
        address: {
          coordinates: newcoordinate,
          flat_number: data.address,
          area: data.area,
          city: data.city,
          pincode: data.pincode,
          state: data.state,
          country: data.country,
        },
        completed_step_index: -1,
        fcm_token: "",
        is_registered: true,
        is_request: true,
      };
      let driverData = {
        first_name: data.FirstName,
        last_name: data.LastName,
        email: data.Email,
        phone_number: data.Phone,
        country_code: "+91",
        // user_type: "transporter",
        age: data.Age,
        address_proof: addressProofPublicUrl,
        identity_proof: identityProofPublicUrl,
        created_at: new Date(),
        driver_photo: profilePublicUrl,
        is_assign: false,
        is_deleted: false,
        is_verified: "pending",
        status: status,
        user_uid: newTransporter.user.uid,
        transporter_as_driver: tad,
      };
      // console.log(req.files,"req files*****");
      // let iconss = [];
      // for (var i = 0; i < req.files.length; i++) {
      //   console.log(req.files,"req files1****");
      //   const iconId = uuidv4();
      //   let base64 = req.files[i].buffer.toString("base64");
      //   let mimetype = req.files[i].mimetype;
      //   const nameArr = req.files[i].originalname.split(".")
      //   const fileLocation = `vehicle-details/${iconId}.${(nameArr.length !== 0) ? nameArr[nameArr.length - 1] : ""}`
      //   const file = bucket.file(fileLocation)
      //   await file.save(req.files[i].buffer, { contentType: mimetype })
      //   await file.setMetadata({
      //     firebaseStorageDownloadTokens: iconId
      //   })

      //   const icon = {
      //     id: iconId,
      //     base64: base64,
      //     dataUrl: `data:${mimetype};${base64}`,
      //     url: `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(fileLocation)}?alt=media&token=${iconId}`,
      //     type: mimetype,
      //   };
      //   iconss.push(icon);
      // }

      const vehicleData = {
        vehicle_type: data.vehicleTypeName,
        vehicle_number: data.VehicleNumber,
        comment: data.Comments,
        chassis_number: data.ChassisNumber,
        vehicle_photos: typeof icons === "string" ? [icons] : icons,
        created_at: new Date(),
        is_assign: false,
        is_deleted: false,
        is_verified: "pending",
        status: status,
      };

      const notification = {
        // type: req.body.type,
        type: "new_driver",
        is_read: false,
        text: `${transporterData.first_name} ${transporterData.last_name} has added ${driverData.first_name} ${driverData.last_name} to his profile, please verify its details at earliest.`,
        created_at: new Date(),
        // user_id: userId,
        title: "New Driver Added",
        // orderId: orderId,
      };
      const userUid = data.userUid;
      const driverUid = data.driverUid;

      console.log(newTransporter.user.uid, "useruid");
      //  console.log(driverUid,"driverUid")


      //        console.log(newTransporter,"new Transpoeter****");




      if (data.phone) {
        const transporterAvailable = await db.collection("users").where("phone_number", "==", data.phone).where("is_deleted", "==", false).where("user_type", "==", "transporter")
        const phone = await transporterAvailable.get();


        const deleteTransporterAvailable = await db.collection("users").where("phone_number", "==", data.phone).where("is_deleted", "==", true).where("user_type", "==", "transporter")
        const deletephone = await deleteTransporterAvailable.get();

        let foundData = [];

        phone?.forEach((doc) => {
          let data = doc.data();
          foundData.push(data)

        })

        let deletedData = []

        deletephone?.forEach((doc) => {
          let data = doc.data();
          deletedData.push(doc.id);
          // console.log(deletedData,">>>:::::::<<<<<<");
        })

        if (deletedData.length > 0) {
          // code for update transporter
          console.log(deletedData[0], "FINALDATA:::::::")
          const updateTransporter = await db.collection("users").doc(deletedData[0]);
          if (tad) {
            await updateTransporter.update(driverAstransporterData);
            // add vehical





            let transporter = await db
              .collection("users")
              .doc(deletedData[0]);
            // .doc();
            // await transporter.set(transporterData);

            // main vehicleDetails created..
            let vh = await db
              .collection("vehicle_details")
              .where("vehicle_number", "==", vehicleData.vehicle_number)

            const v = await vh.get();
            let foundData = null;
            v.forEach((doc) => {
              foundData = doc.data();

            })

            let fc = await db
              .collection("vehicle_details")
              .where("chassis_number", "==", vehicleData.chassis_number)
            const c = await fc.get()
            let foundChessis = null;
            c.forEach((doc) => {
              foundChessis = doc.data();
              // console.log(foundChessis,"chessis")
            })

            if (foundData) {
              console.log("number found")
              return res.status(400).send({
                data: {},
                message: "Vehical already exists!"
              })
              // errors.push({ msg: "Vehical already exists!" });
              // // alert("error")
              // // req.flash("error_msg",errors);
              // return res.render("Users/Transporter/addTransporter", {
              //   vehicleTypes: vehicleTypes,
              //   errors,
              // });
            }
            if (foundChessis) {
              console.log("found chessis")
              return res.status(400).send({
                data: {},
                message: "Chessis number already exists!"
              })
            } else if (tad === true) {
              console.log("driveras transporter")
              // await transporter.set(driverAstransporterData);
            } else {
              console.log(" transporter")
              // await transporter.set(transporterData);
            }
            const vehicle = await transporter.collection("vehicle_details").doc(deletedData[0]);
            await vehicle.set(vehicleData);

            const vehicledetails = await db.collection("vehicle_details").doc();
            await vehicledetails.set(vehicleData);

            let transporterDriverData = {};
            let newDriverData = {};
            if (tad === true) {
              transporterDriverData = {
                ...driverData,
                user_uid: newTransporter.user.uid,
              };

              const transporterDriver = await transporter
                .collection("driver_details")
                .doc();
              await transporterDriver.set(transporterDriverData);
            } else {



              let driverPassword = Math.random().toString(36).slice(-8);

              const newDriver = await firebaseSecondaryApp
                .auth()
                .createUserWithEmailAndPassword(data.Email, driverPassword);

              transporterDriverData = {
                ...driverData,
                temp_password: driverPassword,
                user_uid: newDriver.user.uid,
              };

              newDriverData = {
                ...driverData,
                temp_password: driverPassword,
                transporter_uid: newTransporter.user.uid,
                user_type: "driver",
              };

              let driver = await db.collection("users").doc(deletedData[0]);
              // let driver = await db.collection("users").doc();
              await driver.set(newDriverData);

              const transporterDriver = await transporter
                .collection("driver_details")
                .doc();
              await transporterDriver.set(transporterDriverData);

              firebaseSecondaryApp.auth().signOut();
            }

            firebaseSecondaryApp.auth().signOut();

            await db.collection("notification").add(notification);

            const getAllUsers = await db.collection("users");
            const getUsers = await getAllUsers.get();
            getUsers.forEach(async (user) => {
              if (
                user.data().user_type === "admin" ||
                user.data().user_type === "Admin"
              ) {
                await getAllUsers
                  .doc(user.id)
                  .update({ noti_count: user.data().noti_count + 1 });
              }
            });
            return res.redirect("/transporter/list");




            // return res.redirect("/transporter/list");
          } else {
            await updateTransporter.update(transporterData);
            // add dirver and vehicle

            let transporter = await db
              .collection("users")
              .doc(deletedData[0]);
            // .doc();
            // await transporter.set(transporterData);

            // main vehicleDetails created..
            let vh = await db
              .collection("vehicle_details")
              .where("vehicle_number", "==", vehicleData.vehicle_number)

            const v = await vh.get();
            let foundData = null;
            v.forEach((doc) => {
              foundData = doc.data();

            })

            let fc = await db
              .collection("vehicle_details")
              .where("chassis_number", "==", vehicleData.chassis_number)
            const c = await fc.get()
            let foundChessis = null;
            c.forEach((doc) => {
              foundChessis = doc.data();
              // console.log(foundChessis,"chessis")
            })

            if (foundData) {
              console.log("number found")
              return res.status(400).send({
                data: {},
                message: "Vehical already exists!"
              })
              // errors.push({ msg: "Vehical already exists!" });
              // // alert("error")
              // // req.flash("error_msg",errors);
              // return res.render("Users/Transporter/addTransporter", {
              //   vehicleTypes: vehicleTypes,
              //   errors,
              // });
            }
            if (foundChessis) {
              console.log("found chessis")
              return res.status(400).send({
                data: {},
                message: "Chessis number already exists!"
              })
            } else if (tad === true) {
              console.log("driveras transporter")
              // await transporter.set(driverAstransporterData);
            } else {
              console.log(" transporter")
              // await transporter.set(transporterData);
            }
            const vehicle = await transporter.collection("vehicle_details").doc(deletedData[0]);
            await vehicle.set(vehicleData);

            const vehicledetails = await db.collection("vehicle_details").doc();
            await vehicledetails.set(vehicleData);

            let transporterDriverData = {};
            let newDriverData = {};
            if (tad === true) {
              transporterDriverData = {
                ...driverData,
                user_uid: newTransporter.user.uid,
              };

              const transporterDriver = await transporter
                .collection("driver_details")
                .doc();
              await transporterDriver.set(transporterDriverData);
            } else {
              let driverPassword = Math.random().toString(36).slice(-8);

              const newDriver = await firebaseSecondaryApp
                .auth()
                .createUserWithEmailAndPassword(data.Email, driverPassword);

              transporterDriverData = {
                ...driverData,
                temp_password: driverPassword,
                user_uid: newDriver.user.uid,
              };

              newDriverData = {
                ...driverData,
                temp_password: driverPassword,
                transporter_uid: newTransporter.user.uid,
                user_type: "driver",
              };

              let driver = await db.collection("users").doc(newDriver.user.uid);
              // let driver = await db.collection("users").doc();
              await driver.set(newDriverData);

              const transporterDriver = await transporter
                .collection("driver_details")
                .doc();
              await transporterDriver.set(transporterDriverData);

              firebaseSecondaryApp.auth().signOut();
            }

            firebaseSecondaryApp.auth().signOut();

            await db.collection("notification").add(notification);

            const getAllUsers = await db.collection("users");
            const getUsers = await getAllUsers.get();
            getUsers.forEach(async (user) => {
              if (
                user.data().user_type === "admin" ||
                user.data().user_type === "Admin"
              ) {
                await getAllUsers
                  .doc(user.id)
                  .update({ noti_count: user.data().noti_count + 1 });
              }
            });
            return res.redirect("/transporter/list");


            // return res.redirect("/transporter/list");

          }
        }

        if (foundData.length > 0) {
          console.log(foundData.length, ":::::LENGTH:::::")
          return res.status(400).send({
            data: {},
            message: "Mobile number already exists!"
          })
        }

      }




      let transporter = await db
        .collection("users")
        .doc(newTransporter.user.uid);
      // .doc();
      // await transporter.set(transporterData);

      // main vehicleDetails created..
      let vh = await db
        .collection("vehicle_details")
        .where("vehicle_number", "==", vehicleData.vehicle_number)

      const v = await vh.get();
      let foundData = null;
      v.forEach((doc) => {
        foundData = doc.data();

      })

      let fc = await db
        .collection("vehicle_details")
        .where("chassis_number", "==", vehicleData.chassis_number)
      const c = await fc.get()
      let foundChessis = null;
      c.forEach((doc) => {
        foundChessis = doc.data();
        // console.log(foundChessis,"chessis")
      })

      if (foundData) {
        console.log("number found")
        return res.status(400).send({
          data: {},
          message: "Vehical already exists!"
        })
        // errors.push({ msg: "Vehical already exists!" });
        // // alert("error")
        // // req.flash("error_msg",errors);
        // return res.render("Users/Transporter/addTransporter", {
        //   vehicleTypes: vehicleTypes,
        //   errors,
        // });
      }
      if (foundChessis) {
        console.log("found chessis")
        return res.status(400).send({
          data: {},
          message: "Chessis number already exists!"
        })
      } else if (tad === true) {
        console.log("driveras transporter")
        // await transporter.set(driverAstransporterData);
      } else {
        console.log(" transporter")
        // await transporter.set(transporterData);
      }
      const vehicle = await transporter.collection("vehicle_details").doc();
      await vehicle.set(vehicleData);

      const vehicledetails = await db.collection("vehicle_details").doc();
      await vehicledetails.set(vehicleData);

      let transporterDriverData = {};
      let newDriverData = {};
      if (tad === true) {
        transporterDriverData = {
          ...driverData,
          user_uid: newTransporter.user.uid,
        };

        const transporterDriver = await transporter
          .collection("driver_details")
          .doc();
        await transporterDriver.set(transporterDriverData);
      } else {
        let driverPassword = Math.random().toString(36).slice(-8);

        const newDriver = await firebaseSecondaryApp
          .auth()
          .createUserWithEmailAndPassword(data.Email, driverPassword);

        transporterDriverData = {
          ...driverData,
          temp_password: driverPassword,
          user_uid: newDriver.user.uid,
        };

        newDriverData = {
          ...driverData,
          temp_password: driverPassword,
          transporter_uid: newTransporter.user.uid,
          user_type: "driver",
        };

        let driver = await db.collection("users").doc(newDriver.user.uid);
        // let driver = await db.collection("users").doc();
        await driver.set(newDriverData);

        const transporterDriver = await transporter
          .collection("driver_details")
          .doc();
        await transporterDriver.set(transporterDriverData);

        firebaseSecondaryApp.auth().signOut();
      }

      firebaseSecondaryApp.auth().signOut();

      await db.collection("notification").add(notification);

      const getAllUsers = await db.collection("users");
      const getUsers = await getAllUsers.get();
      getUsers.forEach(async (user) => {
        if (
          user.data().user_type === "admin" ||
          user.data().user_type === "Admin"
        ) {
          await getAllUsers
            .doc(user.id)
            .update({ noti_count: user.data().noti_count + 1 });
        }
      });
      return res.redirect("/transporter/list");
      // return res.render("Users/Transporter/addTransporter", {
      //   message: "Transporter is created...!!",
      //   vehicleTypes: vehicleTypes,
      // });
      // return res.redirect("/transporter/list");

      // const address = {
      //   flatNumber: data.address,
      //   area: data.area,
      //   city: data.city,
      //   pincode: data.pincode,
      //   state: data.state,
      //   country: data.country,
      //   // title: data.city,
      // };

      // await db
      //   .collection("users")
      //   .doc(newTransporter.user.uid)
      //   .collection("address")
      //   .add(address);

      // const transporter = await db.collection("users").doc();
      // await transporter.set(transporterData);

      // await db
      //   .collection("users")
      //   .doc(transporter.id)
      //   .collection("address")
      //   .add(address);
    }
    // return res.redirect("/transporter/list");
  } catch (error) {
    const errors = [];
    if (error.code == "auth/email-already-in-use") {
      errors.push({ msg: "Email already exists!" });
      return res.render("Users/Transporter/addTransporter", {
        vehicleTypes: vehicleTypes,
        errors,
      });
    }
    errors.push({ msg: error.message });
    console.log(errors)
    return res.status(200).json("Users/Transporter/addTransporter", {
      vehicleTypes: vehicleTypes,
      errors,
    });
  }
};

/* Get all the Transporter Controller */
exports.listTransporters = async (req, res) => {
  try {
    const transporters = [];
    const data = await db.collection("users").orderBy('created_at', 'desc').get();
    data.forEach(async (doc) => {
      if (
        (doc.data().user_type == "Transporter" ||
          doc.data().user_type == "transporter") &&
        doc.data().is_deleted === false
      ) {
        const transporter = { id: doc.id, transporterData: doc.data() };
        transporters.push(transporter);
      }
    });
    return res.render("Users/Transporter/displayTransporters", {
      transporters: transporters,
    });
  } catch (error) {
    const errors = [];
    errors.push(error.message);
    return res.render("Users/Transporter/displayTransporters", {
      errors: errors,
    });
  }
};
/* Update Transporter Controller --> GET */
exports.updateTransporter = async (req, res) => {
  try {
    const errors = [];
    const id = req.params.transporter_id;
    const data = await db.collection("users").doc(id).get();
    if (data.data() === undefined) {
      errors.push({ msg: "Transporter not found...!!" });
      return res.render("Errors/errors", { errors: errors });
    }
    const TransporterData = data.data();
    return res.render("Users/Transporter/editTransporters", { transporter: TransporterData });
  } catch (error) {
    const errors = [];
    errors.push({ msg: error.message });
    return res.render("Errors/errors", { errors: errors });
  }
};
/* Update Transporter Controller --> POST */
exports.updatedTransporter = async (req, res) => {
  try {
    const id = req.params.transporter_id;
    const data = req.body;
    let coordinates;
    let newcoordinate;
    var API_KEY = process.env.GOOGLE_MAP_API
    var BASE_URL = "https://maps.googleapis.com/maps/api/geocode/json?address=";
    var address = req.body.address + "," + req.body.area + "," + req.body.city + "," + req.body.state + "," + req.body.country;
    var url = BASE_URL + address + "&key=" + API_KEY;
    const geoData = await fetchdata(url)
    const geoJson = await geoData.json()
    coordinates = geoJson.results.length !== 0 ? geoJson.results[0].geometry.location : ""
    console.log(coordinates)
    newcoordinate = {
      latitude: coordinates.lat ? coordinates.lat.toFixed(6) : coordinates.latitude ? coordinates.latitude.toFixed(6) : 0,
      longitude: coordinates.lng ? coordinates.lng.toFixed(6) : coordinates.longitude ? coordinates.longitude.toFixed(6) : 0
    }
    const { valid, errors } = validateTransporterData(data);

    if (!valid) {
      if (errors.length > 0) {
        for (var i = 0; i <= errors.length; i++) {
          req.flash("error_msg", errors[i].msg);
          return res.redirect(`/transporter/${id}/updateTransporter`);
        }
      }
    }
    const transporterData = {
      first_name: data.firstname,
      last_name: data.lastname,
      email: data.email,
      phone_number: data.phone,
      register_number: data.registerNo,
      gst_number: data.gstNo,

      address: {
        coordinates: newcoordinate,
        flat_number: data.address,
        area: data.area,
        city: data.city,
        pincode: data.pincode,
        state: data.state,
        country: data.country,
      },
    };
    const driverData = {
      first_name: data.firstname,
      last_name: data.lastname,
      email: data.email,
      phone_number: data.phone,
    }
    const updateTransporter = db.collection("users").doc(id);
    const checking = await updateTransporter.get();
    const final = checking.data();
    console.log(final, "FINALL:::::::::")
    if (final.transporter_as_driver === true) {
      await updateTransporter.update(transporterData);
      const tr = await db.collection("users").doc(id);
      const dt = await tr.collection("driver_details");
      const dd = await dt.get();
      let driverid = null;
      dd.forEach((doc) => {
        driverid = doc.id;
      })
      const fd = await dt.doc(driverid);
      await fd.update(driverData)
      return res.redirect("/transporter/list");
    } else {
      await updateTransporter.update(transporterData);
      return res.redirect("/transporter/list");
    }


  } catch (error) {
    const errors = [];
    errors.push({ msg: error.code });
    return res.render("Errors/errors", { errors: errors });
  }
};


/* Change Status of the Transporter Controller */
exports.changeTransporterStatus = async (req, res) => {
  try {
    const errors = [];
    const id = req.params.transporter_id;
    const transporterData = await db.collection("users").doc(id);
    const getTransporterData = await transporterData.get();
    const data = await getTransporterData.data();

    if (!data) {
      errors.push({ msg: "There is no data available" });
      return res.render("Users/Transporter/displayTransporters", {
        errors: errors,
      });
    }

    const Status = {
      status: !data.status,
      reason: req.body.reason
    };

    const updateData = {
      reason: req.body.reason,
      type: "users",
      id: await db.doc("users/" + id),
      user_id: await firebase.auth().currentUser.uid,
      updated_at: new Date(),
      status: Status.status,
    };
    if (data.transporter_as_driver === true) {
      await transporterData.update(Status);
      const tr = await db.collection("users").doc(id);
      const dt = await tr.collection("driver_details");
      const dd = await dt.get();
      let driverid = null;
      dd.forEach((doc) => {
        driverid = doc.id;
      })
      const fd = await dt.doc(driverid);
      await fd.update(Status)
      return res.redirect("/transporter/list");
    } else {
      await transporterData.update(Status);
      await db.collection("status_logs").add(updateData);
      // return res.redirect("/transporter/list");
    }



    return res.redirect("/transporter/list");
  } catch (error) {
    console.log(error);
  }
};

/* Delete transporter Controller */
exports.removeTransporter = async (req, res) => {
  try {
    const errors = [];
    const id = req.params.transporter_id;
    // console.log("HELLO YOU ARE IN DELETE API OF TRANSPORTER");
    // console.log("DATA", data);
    // console.log("ID", id);

    const transporterData = await db.collection("users").doc(id);

    // here get all driver
    const drivers = [];
    let getDrivers = await transporterData
      .collection("driver_details")
      .get();

    getDrivers.forEach(async (doc) => {
      if (doc.data().is_assign === true) {
        const driver = {
          id: doc.id,
          driverData: doc.data(),
          transporter_id: id,
        };
        drivers.push(driver);
      }
    });

    const updateData = {
      reason: req.body.reason,
      is_deleted: true,
      status: false,
    };

    if (!transporterData) {
      errors.push({ msg: "There are no data available" });
      return res.render("User/Transporter/displayTransporters", {
        errors: errors,
      });
    }

    const deletedData = {
      type: "users",
      id: await db.doc("users/" + id),
      user_id: await firebase.auth().currentUser.uid,
      deleted_at: new Date(),
    };
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

    const deleteDriver = async (id) => {
      const transporter = await db.collection("users").doc(id);
      const getDrivers = await transporter.collection("driver_details").get();

      getDrivers.forEach(async (doc) => {
        if (id !== doc.data().user_uid) {
          let driverId = doc.data().user_uid;
          const user = await db.collection("users").doc(driverId);
          await user.update(updateData);
        }
      });

      getDrivers.forEach(async (doc) => {

        const updateData = {
          // reason: req.body.reason,
          is_deleted: true,
          status: false,
        };
        let dd = await transporterData
          .collection("driver_details")
          .doc(doc.id);
        await dd.update(updateData);
      });
    }

    const deleteVehicle = async (id) => {
      const transporter = await db.collection("users").doc(id);
      const getVehicle = await transporter.collection("vehicle_details").get();

      getVehicle.forEach(async (doc) => {
        let vehicleId = doc.id;
        const vehicle = await db.collection("vehicle_details").doc(vehicleId);
        await vehicle.update(updateData);
      });
      getVehicle.forEach(async (doc) => {

        const updateData = {
          // reason: req.body.reason,
          is_deleted: true,
          status: false,
        };
        let dd = await transporterData
          .collection("vehicle_details")
          .doc(doc.id);
        await dd.update(updateData);
      });
    }

    // here need to check
    if (drivers.length === 0) {
      deleteDriver(id);
      deleteVehicle(id);
      await transporterData.update(updateData);

      await db.collection("deletion_logs").add(deletedData);

      return res.redirect("/transporter/list");
    } else {
      errors.push({ msg: "You cannot delete this user until an order is ongoing." });
      return res.send(errors)
      // return res.redirect("/transporter/list");
      //    return res.render("Users/Transporter/displayTransporters", {
      // errors
      //     });
    }
  } catch (error) {
    console.log(error);
  }
};

/* Get Details of a Transporter  Controller */
exports.transporterDetails = async (req, res) => {
  try {
    const id = req.params.transporter_id;

    const getTransporterById = await db.collection("users").doc(id);
    const data = await getTransporterById.get();
    if (data.data() == undefined) {
      req.flash("error_msg", "Transporter not found...!!");
      return res.redirect("/transporter/list");
    } else {
      const drivers = [];
      const vehicles = [];
      const orders = [];

      let getDrivers = await getTransporterById
        .collection("driver_details")
        .get();

      getDrivers.forEach(async (doc) => {
        if (doc.data().is_deleted === false || doc.data().transporter_as_driver === true) {
          const driver = {
            id: doc.id,
            driverData: doc.data(),
            transporter_id: id,
          };
          drivers.push(driver);
        }
      });

      let getVehicles = await getTransporterById
        .collection("vehicle_details")
        .get();

      getVehicles.forEach(async (doc) => {
        if (doc.data().is_deleted === false) {
          const vehicle = {
            id: doc.id,
            vehicleData: doc.data(),
            transporter_id: id,
          };
          vehicles.push(vehicle);
        }
      });

      let getOrders = await db.collection("order_details").get();

      getOrders.forEach(async (doc) => {
        if (doc.data().transporter_uid == id) {
          const order = {
            id: doc.id,
            orderData: doc.data(),
            transporter_id: id,
          };
          orders.push(order);
        }
      });
      console.log(drivers, "drivers setails")
      let transporter = { id: data.id, transporterData: data.data() };
      return res.render("Users/Transporter/transporterDetails", {
        transporter: transporter,
        drivers: drivers,
        vehicles: vehicles,
        orders: orders,
      });
      // return res.redirect("/transporter/list");
    }
  } catch (error) {
    req.flash("error_msg", error.message);
    return res.redirect("/transporter/list");
  }
};

/* Verify Transporter Controller --> GET */
exports.verifyTransporter = async (req, res) => {
  try {
    const id = req.params.transporter_id;

    const getTransporterById = await db.collection("users").doc(id);
    const data = await getTransporterById.get();
    if (data.data() == undefined) {
      req.flash("error_msg", "Transporter not found...!!");
      return res.redirect("/transporter/list");
    }
    {
      const drivers = [];
      const vehicles = [];

      let getDrivers = await getTransporterById
        .collection("driver_details")
        .get();

      getDrivers.forEach(async (doc) => {
        if (doc.data().is_deleted === false) {
          const driver = {
            id: doc.id,
            driverData: doc.data(),
            transporter_id: id,
          };
          drivers.push(driver);
        }
      });

      let getVehicles = await getTransporterById
        .collection("vehicle_details")
        .get();

      getVehicles.forEach(async (doc) => {
        if (doc.data().is_deleted === false) {
          const vehicle = {
            id: doc.id,
            vehicleData: doc.data(),
            transporter_id: id,
          };
          vehicles.push(vehicle);
        }
      });

      let transporter = { id: data.id, transporterData: data.data() };
      return res.render("Users/Transporter/verifyTransporter", {
        transporter: transporter,
        drivers: drivers,
        vehicles: vehicles,
      });
    }
  } catch (error) {
    req.flash("error_msg", error.message);
    return res.redirect("/transporter/list");
  }
};

/* Verify Transporter Controller --> POST */
exports.verifiedTransporter = async (req, res) => {
  try {
    const id = req.params.transporter_id;

    const data = req.body;

    const getTransporterById = await db.collection("users").doc(id);
    const transporter = await getTransporterById.get();
    const transporterData = await transporter.data();

    const drivers = [];
    const vehicles = [];

    if (data.verifyDriver === "checked") {
      let getTransporterDrivers = await getTransporterById.collection(
        "driver_details"
      );
      let getDrivers = await getTransporterDrivers.get();

      getDrivers.forEach(async (doc) => {
        if (doc.data().is_deleted === false) {
          const driver = {
            id: doc.id,
            driverData: doc.data(),
            transporter_id: id,
          };
          drivers.push(driver);
        }
      });

      const transporterDriver = await drivers[0].id;
      const transporterDriverData = await getTransporterDrivers.doc(
        transporterDriver
      );

      if (
        drivers.length === 1 &&
        drivers[0].driverData.email !== transporterData.email
      ) {
        const driverUID = drivers[0].driverData.user_uid;

        await transporterDriverData.update({ is_verified: "verified" });

        const driverUser = await db.collection("users").doc(driverUID);
        await driverUser.update({ is_verified: "verified" });
      } else {
        await transporterDriverData.update({ is_verified: "verified" });
        // req.flash("error_msg", "There are multile drivers to verify..!!");
        // res.redirect("/transporter/displayTransporters");
      }
      await getTransporterById.update({ is_request: true });
    }

    if (data.verifyVehicle === "checked") {
      let getTransporterVehicles = await getTransporterById.collection(
        "vehicle_details"
      );
      let getVehicles = await getTransporterVehicles.get();

      getVehicles.forEach(async (doc) => {
        if (doc.data().is_deleted === false) {
          const vehicle = {
            id: doc.id,
            vehicleData: doc.data(),
            transporter_id: id,
          };
          vehicles.push(vehicle);
        }
      });

      const transporterVehicle = await vehicles[0].id;
      const transporterVehicleData = await getTransporterVehicles.doc(
        transporterVehicle
      );

      if (vehicles.length === 1) {
        await transporterVehicleData.update({ is_verified: "verified" });
      } else {
        req.flash("error_msg", "There are multile Vehicles to verify..!!");
        res.redirect("/transporter/list");
      }
    }

    await getTransporterById.update({ is_verified: "verified" });
    return res.redirect("/transporter/list");
  } catch (error) {
    req.flash("error_msg", error.message);
    return res.redirect("/transporter/list");
  }
};

// FIELDS
// 1. reg_no 2. gst_no 3. is_register

/*
  Create Transporter API
*/
// exports.newTransporterApi = async (req, res) => {
//   try {
//     const data = {
//       email: req.body.email,
//       password: req.body.password,
//       firstname: req.body.firstname,
//       lastname: req.body.lastname,
//       phone: req.body.phone,
//       address: req.body.address,
//       area: req.body.area,
//       city: req.body.city,
//       pincode: req.body.pincode,
//       state: req.body.state,
//       country: req.body.country,
//       registerNo: req.body.registerNo,
//       gstNo: req.body.gstNo,
//       // documentType: req.body.documentType,
//       status: req.body.status,
//     };

//     // const { valid, errors } = validateTransporterData(data);

//     // if (!valid) {
//     //   return res.render("Users/Transporter/addTransporter", {
//     //     errors,
//     //   });
//     // }

//     const newTransporter = await firebaseSecondaryApp
//       .auth()
//       .createUserWithEmailAndPassword(data.email, data.password);

//     // let status = null;
//     // if (data.status == "true") {
//     //   status = Boolean(!!data.status);
//     // } else {
//     //   status = Boolean(!data.status);
//     // }

//     const transporterData = {
//       first_name: data.firstname,
//       last_name: data.lastname,
//       email: data.email,
//       phone_number: data.phone,
//       user_type: "transporter",
//       register_number: data.registerNo,
//       gst_number: data.gstNo,
//       status: data.status,
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

//     if (newTransporter) {
//       await db
//         .collection("users")
//         .doc(newTransporter.user.uid)
//         .set(transporterData);

//       await db
//         .collection("users")
//         .doc(newTransporter.user.uid)
//         .collection("address")
//         .add(address);

//       firebaseSecondaryApp.auth().signOut();
//       return res.status(201).send({
//         data: { transporterData, address },
//         message: "Transporter is added...!!",
//       });
//     }
//   } catch (error) {
//     return res.status(400).send({ error: error.message });
//   }
// };
