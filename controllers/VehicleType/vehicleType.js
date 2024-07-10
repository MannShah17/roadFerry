const { db, firebase, bucket, firebaseAdmin } = require("../../config/admin");
const { validateVehicleTypeData } = require("./vehicleTypeHelper");

const { v4: uuidv4 } = require('uuid');

/* Function to get rates */
const vehicleRates = (kmFrom, kmTo, price) => {
  let newAry = [];
  let result = [];
  let obj = {};

  let len = kmFrom.length;
  const doubleLen = len * 2;

  if (typeof kmFrom === "string") {
    obj = {
      start: kmFrom,
      end: kmTo,
      rate: price,
    };
    result.push(obj);
    return result;
  }

  newAry = kmFrom.concat(kmTo, price);
  let newAryLen = newAry.length;

  if (newAryLen % len == 0) {
    for (var i = 0; i < newAryLen; i++) {
      obj = {
        start: newAry[i],
        end: newAry[i + len],
        rate: newAry[i + doubleLen],
      };
      if (
        obj.start != undefined &&
        obj.end != undefined &&
        obj.rate != undefined
      ) {
        result.push(obj);
      }
    }
  }
  return result;
};

/* Create new Vehicle Type Controller */
exports.newVehicleType = async (req, res) => {
  try {
    const data = req.body;

    // console.log("*****DATA*****", data);

    const { valid, errors } = validateVehicleTypeData(data);

    if (!valid) {
      return res.render("VehicleType/addVehicleType", { errors });
    }
    // let start = [] ;
    // let end = [];
    // for (var i=0; i<= data.kmFrom.length; i++){
      
    //   start.push(data.kmFrom[i])
    // }
    // for (var i=0; i<= data.kmTo.length; i++){
      
    //   end.push(data.kmTo[i])
    // }
    // for(var i=0; i<=start.length-2; i++){
    //   if(Number(start[i]) > Number(end[i])){
    //     const error = "Please Check kilo meter"
    //     req.flash("error_msg", error);
    //       return res.redirect(`/vehicle-type/addVehicleType`);
    //   }else{
    //     console.log("1")
    //   }
    // }
    const rates = await vehicleRates(data.kmFrom, data.kmTo, data.price);

  let Totals =[];
      for(var j = 0; j < rates.length; j++){
        let totalrate =0
        totalrate = totalrate +(rates[j].end-rates[j].start)*rates[j].rate;
        Totals.push(totalrate);
      }
  let sum = 0;
    for (let k = 0; k < Totals.length; k++) {
      sum += Totals[k];
    }
  const TotalBill =   sum + Number.parseInt(data.minimumRate);
    // console.log(TotalBill,"Total mali gayu");

      const iconId = uuidv4();
      let base64 = req.files[0].buffer.toString("base64");
      let mimetype = req.files[0].mimetype;
      const nameArr = req.files[0].originalname;
      const fileLocation = `vehicle-types/${iconId}`
      const file = bucket.file(fileLocation)
      await file.save(req.files[0].buffer, { contentType: mimetype })
      await file.setMetadata({
        firebaseStorageDownloadTokens: iconId
      })
      
      const icons = 
        `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(fileLocation)}?alt=media&token=${iconId}`
      ;

    let start = [] ;
    let end = [];
    for (var i=0; i<= data.kmFrom.length; i++){
      
      start.push(data.kmFrom[i])
    }
    for (var i=0; i<= data.kmTo.length; i++){
      
      end.push(data.kmTo[i])
    }
    // console.log(start)
    // console.log(end.length)

    const vehicleData = {
      vehicle_type: data.name,
      vahicle_capacity: data.capacity,
      dimensions: {
        v_length: data.vehicleLength,
        v_width: data.vehicleWidth,
        v_height: data.vehicleHeight,
      },
      minimumRate:data.minimumRate,
      rates: rates,
      icon: icons,
      is_deleted: false,
      created_at:new Date(),
    };

    // console.log("*****VEHICLE DATA*****", vehicleData);

    const newVehicle = await db.collection("vehicles").doc();
    await newVehicle.set(vehicleData);
    res.render("VehicleType/addVehicleType");
  } catch (error) {
    const errors = [];
    errors.push({ msg: error.message });
    return res.render("VehicleType/addVehicleType", {
      errors,
    });
  }
};

/* Get List of all the Vehicle Types Controller */
exports.listVehicleTypes = async (req, res) => {
  try {
    const vehicles = [];
    const data = await db.collection("vehicles").get();
    data.forEach((doc) => {
      if (doc.data().is_deleted === false) {
        const vehicle = { id: doc.id, vehicleData: doc.data() };
        vehicles.push(vehicle);
      }
    });
    return res.render("VehicleType/displayVehicleTypes", {
      vehicles: vehicles,
    });
  } catch (error) {
    const errors = [];
    errors.push({ msg: error.message });
    return res.render("Errors/errors", { errors: errors });
  }
};

/* Remove Vehicle Type Controller */
exports.removeVehicleType = async (req, res) => {
  try {
    const errors = [];
    const id = req.params.vehicleType_id;
    // console.log("*****ID*****", id);

    const getVehicleTypeById = await db.collection("vehicles").doc(id);
    const vehicleTypeData = await getVehicleTypeById.get();
    const vehicleType = await vehicleTypeData.data();
    // console.log("*****VEHICLE TYPE DATA*****", vehicleType);

    if (vehicleType === undefined) {
      errors.push({ msg: "Vehicle-Type not found...!!" });
      res.render("Errors/errors", { errors: errors });
    }

    let counter = 0;
    const orders = await db.collection("order_details").get();
    orders.forEach((doc) => {
      if (doc.data().vehicle_type === vehicleType.vehicle_type) {
        counter++;
      }
    });

    if (counter == 0) {
      const updateData = {
        reason: req.body.reason,
        is_deleted: true,
      };
      const result = req.cookies['userId'];      
      const deletedData = {
        type: "vehicle-type",
        id: await db.doc("vehicles/" + id),
        user_id: result,
        deleted_at: new Date(),
      };

      // console.log("*******", updateData);

      await getVehicleTypeById.update(updateData);
      await db.collection("deletion_logs").add(deletedData);

      return res.redirect("back");
      // return res.redirect("/vehicle-type/displayVehicleTypes") ;
    }
    // req.flash(
    //   "error_msg",
    //   `You cannot delete ${vehicleType.vehicle_type} because it is associated with some order`
    // );
    // return res.redirect("/vehicle-type/displayVehicleTypes");

    errors.push({
      msg: `You cannot delete ${vehicleType.vehicle_type} because it is associated with some order`,
    });
    res.render("Errors/errors", {
      errors: errors,
    });
  } catch (error) {
    const errors = [];
    console.log(error);
    errors.push({ msg: error.message });
    return res.render("Errors/errors", {
      errors: errors,
    });
  }
};

/* Get a Details of a Vehicle Type Controller */
exports.vehicleTypeDetails = async (req, res) => {
  try {
    const errors = [];
    const id = req.params.vehicleType_id;

    const data = await db.collection("vehicles").doc(id).get();
    if (data.data() === undefined) {
      errors.push({ msg: "Vehicle-type not found...!!" });
      return res.render("Errors/errors", { errors: errors });
    }
    const vehicleData = data.data();

    return res.render("VehicleType/vehicleTypeDetails", {
      vehicle: vehicleData,
    });
  } catch (error) {
    const errors = [];
    errors.push({ msg: error.message });
    return res.render("Errors/errors", { errors: errors });
  }
};

/* Update Vehicle Type Controller --> GET */
exports.updateVehicleType = async (req, res) => {
  try {
    const errors = [];
    const id = req.params.vehicleType_id;
    const data = await db.collection("vehicles").doc(id).get();
    if (data.data() === undefined) {
      errors.push({ msg: "Vehicle-type not found...!!" });
      return res.render("Errors/errors", { errors: errors });
    }
    const vehicleData = data.data();
    return res.render("VehicleType/editVehicleType", { vehicle: vehicleData });
  } catch (error) {
    const errors = [];
    errors.push({ msg: error.message });
    return res.render("Errors/errors", { errors: errors });
  }
};

/* Update Vehicle Type Controller --> POST */
exports.updatedVehicleType = async (req, res) => {
  try {
    const id = req.params.vehicleType_id;

    const data = req.body;
    // console.log("*****DATA*****", data);
    const { valid, errors } = validateVehicleTypeData(data);

    if (!valid) {
      if (errors.length > 0) {
        for (var i = 0; i <= errors.length; i++) {
          req.flash("error_msg", errors[i].msg);
          return res.redirect(`/vehicle-type/${id}/edit`);
        }
      }
    }
    let start = [] ;
    let end = [];
    for (var i=0; i<= data.kmFrom.length; i++){
      
      start.push(data.kmFrom[i])
    }
    for (var i=0; i<= data.kmTo.length; i++){
      
      end.push(data.kmTo[i])
    }
    // console.log(end[end.length - 2],".....././..././././././")
    for(var i=0; i<=start.length-2; i++){
      if( end[end.length - 2] == -1 ){
        console.log("........")
      }else{
        if(Number(start[i]) > Number(end[i])){
          const error = "Please Check kilo meter"
          req.flash("error_msg", error);
            return res.redirect(`/vehicle-type/${id}/edit`);
        }else{
          console.log("wwwwwwww")
        }
      }
      
    }
// console.log(start,"start")
// console.log(end,"end")

    const rates = await vehicleRates(data.kmFrom, data.kmTo, data.price);

    

    const vehicleData = {
      vehicle_type: data.name,
      vahicle_capacity: data.capacity,
      minimumRate:data.minimumRate,
      dimensions: {
        v_length: data.vehicleLength,
        v_width: data.vehicleWidth,
        v_height: data.vehicleHeight,
      },
      rates: rates,
      
    };

    // console.log("*****VEHICLE DATA*****", vehicleData);

    const newVehicle = db.collection("vehicles").doc(id);
    await newVehicle.update(vehicleData);
    return res.redirect("/vehicle-type/list");
    // return res.render("VehicleType/displayVehicleTypes", {
    //   message: "Vehicle is Added...!!",
    // });
  } catch (error) {
    const errors = [];
    errors.push({ msg: error.code });
    return res.render("VehicleType/editVehicleType", { errors: errors });
  }
};
