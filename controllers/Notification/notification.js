const { formatNotificationMessage } = require("./utils");

const { db, firebase, messaging } = require("../../config/admin");
 
const checkIfTransporterAccepted = async (body, userFcmToken) => {
  const sendInMinutes = 15 * 60 * 1000;
  const timer = setTimeout(async () => {
    const data = await db
      .collection("order_details")
      .where("order_id", "==", body.order_id);

    const order_details = await data.get();
    

    order_details.forEach(async (doc) => {
      if (doc.data().status === "pending") {
        const orderData = await doc.data();
        const updatedOrderData = {};

        const user = await db
          .collection("users")
          .doc(orderData.requested_uid)
          .get();

        const userFcmToken = await user.data().fcm_token;

        console.log(orderData);

        // const fireToken = [userFcmToken];
        const fireToken = userFcmToken;

        const notification = {
          type: body.type,
          is_read: false,
          text: `${orderData.transporter_details.first_name} ${orderData.transporter_details.last_name} has not accepted or not assigned your trip to the driver for order ${orderData.order_id}`,
          created_at: new Date(),
          user_id: orderData.requested_uid,
          title: "Request",
          orderId: body.order_id.toString(),
        };

        let obj = {
          title: "Request",
          body: `${orderData.transporter_details.first_name} ${orderData.transporter_details.last_name} has not accepted or not assigned your trip to the driver for order ${orderData.order_id}`,
          date: new Date().toISOString(),
          type: body.type,
          orderId: body.order_id.toString(),
          badge: "0",
          sound: "default",
        };
        const payload = {
          data: obj,
          notification: obj,
        };

        messaging
          .sendToDevice(fireToken, payload)
          .then(function (response) {
            return response;
          })
          .catch(function (err) {
            console.log("Error occured", err);
          });

        if(orderData.rejected_transporters?.length > 0){
          updatedOrderData.rejected_transporters = [...orderData.rejected_transporters,orderData.transporter_uid];
        }
        else{
          updatedOrderData.rejected_transporters = [orderData.transporter_uid];
        }
        updatedOrderData.status = "pending";
        updatedOrderData.transporter_uid = null;
        updatedOrderData.transporter_details = {};

        const updateOrderStatus = await db
            .collection("order_details")
            .doc(doc.id)
            .update(updatedOrderData);


      }
    });
  }, sendInMinutes);
};

const getReceiverFcmToken = async (drop_location={}, sender_phone_number="") => {
  const {notify, phone_number} = drop_location;
  let fcmToken;
  if(notify === true && phone_number && phone_number != sender_phone_number){
    const receiver = await db.collection("users")
    .where("user_type", "==", "customer")
    .where("phone_number", "==", phone_number)
    .get();
    if(receiver.docs[0] && receiver.docs[0].data()){
      fcmToken = await receiver.docs[0].data().fcm_token;
    }
  }
  return fcmToken;
}

exports.sendNotification = async (req, res) => {
  console.log("send notify",req.body.type)
  try {
    let ntitle = "",
      nbody = "",
      orderId = "",
      userId = "",
      userFcmToken = [],
      text = "";
    if (!req.body.type) { 
      return res.status(400).send({ message: "Notification type required." });
    }

    if(req.body.transporterId === req.body.userId){
      return res.status(400).send({ message: "Invalid notification call. Requester ID and receiver ID are same." });
    }

    const getTypeText = await db.collection("notification_type").get();
    getTypeText.forEach((item) => {
      if (item.data().type === req.body.type) {
        text = item.data().text;
      }
    });
    if (req.body.type == "accept") {
      userId = req.body.userId;
      if (req.body.userId == "" || req.body.userId == undefined) {
        return res.status(400).send({ message: "User id is required." });
      }
      // } else if (req.body.orderId == "" || req.body.orderId == undefined) {
      //   return res.status(400).send({ message: "Order id is required." });
      // }

      const user = await db.collection("users").doc(req.body.userId).get();
      console.log("USER", user.data());
      userFcmToken.push(await user.data().fcm_token);

      const order = await db
        .collection("order_details")
        .doc(req.body.orderId)
        .get();
      

      const orderData = await order.data();
      const receiverFcmToken = await getReceiverFcmToken(orderData.drop_location, user.data()?.phone_number);
      if(receiverFcmToken) userFcmToken.push(receiverFcmToken);
          
      const tFirstName = orderData.transporter_details.first_name;
      const tLastName = orderData.transporter_details.last_name;
      const tPhoneNumber = orderData.transporter_details.phone_number;
      ntitle = "Transporter Confirmed";
      nbody = formatNotificationMessage({
        dynamicValues: {
          transporterName: `${tFirstName} ${tLastName}`,
          transporterPhoneNumber: tPhoneNumber,
          trackingID: orderData.order_id
        },
        text
      })
      orderId = req.body.orderId;
    } else if (req.body.type == "unloaded") {
      userId = req.body.userId;
      if (req.body.userId == "" || req.body.userId == undefined) {
        return res.status(400).send({ message: "User id is required." });
      } else if (req.body.orderId == "" || req.body.orderId == undefined) {
        return res.status(400).send({ message: "Order id is required." });
      }

      const user = await db.collection("users").doc(req.body.userId).get();
      userFcmToken.push(await user.data().fcm_token);

      const order = await db
        .collection("order_details")
        .doc(req.body.orderId)
        .get();
      const orderData = await order.data();

      const receiverFcmToken = await getReceiverFcmToken(orderData.drop_location, user.data()?.phone_number);
      if(receiverFcmToken) userFcmToken.push(receiverFcmToken);

      const dFirstName = await orderData.driver_details.first_name;
      const dLastName = await orderData.driver_details.last_name;
      const tFirstName = await orderData.transporter_details.first_name;
      const tLastName = await orderData.transporter_details.last_name;
      const orderNo = await orderData.order_id;
      const flatNumber = await orderData.drop_location.flat_name;
      const area = await orderData.drop_location.area;
      const city = await orderData.drop_location.city;
      const state = await orderData.drop_location.state;
      const pincode = await orderData.drop_location.pincode;
      const country = await orderData.drop_location.country;
      const address = `${flatNumber} ${area} ${city} ${pincode} ${state} ${country}`;

      ntitle = "Delivery Completed";
      nbody = formatNotificationMessage({
        dynamicValues: {
          transporterName: `${tFirstName} ${tLastName}`,
          deliveryAddress: address,
          trackingID: orderNo
        },
        text
      });
      orderId = req.body.orderId;
    } else if (req.body.type == "confirm") {
      userId = req.body.userId;
      if (req.body.userId == "" || req.body.userId == undefined) {
        return res.status(400).send({ message: "User id is required." });
      } else {
        const user = await db.collection("users").doc(req.body.userId).get();
        userFcmToken.push(await user.data().fcm_token);

        const order = await db
          .collection("order_details")
          .doc(req.body.orderId)
          .get();
        const orderData = await order.data();

        const receiverFcmToken = await getReceiverFcmToken(orderData.drop_location, user.data()?.phone_number);
        if(receiverFcmToken) userFcmToken.push(receiverFcmToken);

        const customerUid = await orderData.requested_uid;
        const customer = await db.collection("users").doc(customerUid).get();
        const cFirstName = await customer.data().first_name;
        const cLastName = await customer.data().last_name;
        const customerName = `${cFirstName} ${cLastName}`;

        ntitle = "Customer Confirmed";
        nbody = `${customerName} ${text}`;
        orderId = req.body.orderId;
      }
    } else if (req.body.type == "assign") {
      userId = req.body.userId;
      if (req.body.userId == "" || req.body.userId == undefined) {
        return res.status(400).send({ message: "User id is required." });
      } else if (req.body.orderId == "" || req.body.orderId == undefined) {
        return res.status(400).send({ message: "Order id is required." });
      }

      const user = await db.collection("users").doc(req.body.userId).get();
      userFcmToken.push(await user.data().fcm_token);

      const order = await db
        .collection("order_details")
        .doc(req.body.orderId)
        .get();
      const orderData = await order.data();
      
      const receiverFcmToken = await getReceiverFcmToken(orderData.drop_location, user.data()?.phone_number);
      if(receiverFcmToken) userFcmToken.push(receiverFcmToken);

      const tFirstName = await orderData.transporter_details.first_name;
      const tLastName = await orderData.transporter_details.last_name;
      const dFirstName = await orderData.driver_details.first_name;
      const dLastName = await orderData.driver_details.first_name;
      const vehicle_number = await orderData.vehicle_details.vehicle_number;
      const tPhoneNumber = await orderData.transporter_details.phone_number;
      ntitle = "Order Assigned";
      nbody = formatNotificationMessage({
        dynamicValues: {
          transporterName: `${tFirstName} ${tLastName}`,
          driverName: `${dFirstName} ${dLastName}`,
          transporterPhoneNumber: tPhoneNumber,
          vehicleNumber: vehicle_number
        },
        text
      })
      orderId = req.body.orderId;
    } else if (req.body.type == "new_driver") {
      userId = req.body.userId;
      if (req.body.userId == "" || req.body.userId == undefined) {
        return res.status(400).send({ message: "User id is required." });
      } else if (req.body.transporterId == "" || req.body.transporterId == undefined) {
        return res.status(400).send({ message: "Order id is required." });
      }

      const newDriver = await db.collection("users").doc(req.body.userId).get();
      const driverData = await newDriver.data();
      const transporter = await db.collection("users").doc(driverData.transporter_uid).get();
      const trData = await transporter.data();
      userFcmToken.push(await transporter.data().fcm_token);

      const tFirstName = await trData.first_name;
      const tLastName = await trData.last_name;
      const dFirstName = await driverData.first_name;
      const dLastName = await driverData.last_name;
      ntitle = "New Driver Created";
      nbody = `${tFirstName} ${tLastName} ${text.slice(
        0,
        9
      )} ${dFirstName} ${dLastName} ${text.slice(10, 64)} `;
      orderId = "";
    } else if (req.body.type == "driver_reject") {
      userId = req.body.userId;
      if (req.body.userId == "" || req.body.userId == undefined) {
        return res.status(400).send({ message: "User id is required." });
      } else if (req.body.orderId == "" || req.body.orderId == undefined) {
        return res.status(400).send({ message: "Order id is required." });
      }

      const user = await db.collection("users").doc(req.body.userId).get();
      userFcmToken.push(await user.data().fcm_token);

      const order = await db
        .collection("order_details")
        .doc(req.body.orderId)
        .get();
      const orderData = await order.data();
      
      const receiverFcmToken = await getReceiverFcmToken(orderData.drop_location, user.data()?.phone_number);
      if(receiverFcmToken) userFcmToken.push(receiverFcmToken);

      const dFirstName = await orderData.driver_details.first_name;
      const dLastName = await orderData.driver_details.first_name;
      const orderNo = await orderData.order_id;
      ntitle = "Driver Rejected";
      nbody = `${dFirstName} ${dLastName} ${text.slice(
        0,
        28
      )} ${orderNo} ${text.slice(29)}.`;
      orderId = req.body.orderId;
    } else if (req.body.type == "transporter_reject") {
      userId = req.body.userId;
      if (req.body.userId == "" || req.body.userId == undefined) {
        return res.status(400).send({ message: "User id is required." });
      } else if (req.body.orderId == "" || req.body.orderId == undefined) {
        return res.status(400).send({ message: "Order id is required." });
      } else if (
        req.body.transporterId == "" ||
        req.body.transporterId == undefined
      ) {
        return res.status(400).send({ message: "Transporter id is required." });
      }

      const user = await db.collection("users").doc(req.body.userId).get();
      userFcmToken.push(await user.data().fcm_token);

      const oldTransporter = await db
        .collection("users")
        .doc(req.body.transporterId)
        .get();
      const oldTransporterData = await oldTransporter.data();
      const oldTFirstName = await oldTransporterData.first_name;
      const oldTLastName = await oldTransporterData.last_name;
      const oldTransporterName = `${oldTFirstName} ${oldTLastName}`;

      const order = await db
        .collection("order_details")
        .doc(req.body.orderId)
        .get();
      const orderData = await order.data();
      
      const receiverFcmToken = await getReceiverFcmToken(orderData.drop_location, user.data()?.phone_number);
      if(receiverFcmToken) userFcmToken.push(receiverFcmToken);

      const newTFirstName = await orderData.transporter_details.first_name;
      const newTLastName = await orderData.transporter_details.last_name;
      const newTransporterName = `${newTFirstName} ${newTLastName}`;
      const orderNo = await orderData.order_id;
      ntitle = "Transporter Rejected";
      nbody = formatNotificationMessage({
        dynamicValues: {
          oldTransporterName,
          newTransporterName,
          orderID: orderNo
        },
        text
      });
      orderId = req.body.orderId;
    } else if (req.body.type == "no_transporter_reject") {
      userId = req.body.userId;
      if (req.body.userId == "" || req.body.userId == undefined) {
        return res.status(400).send({ message: "User id is required." });
      } else if (req.body.orderId == "" || req.body.orderId == undefined) {
        return res.status(400).send({ message: "Order id is required." });
      } else if (
        req.body.transporterId == "" ||
        req.body.transporterId == undefined
      ) {
        return res.status(400).send({ message: "Transporter id is required." });
      }

      const user = await db.collection("users").doc(req.body.userId).get();
      userFcmToken.push(await user.data().fcm_token);

      const order = await db
        .collection("order_details")
        .doc(req.body.orderId)
        .get();
      const orderData = await order.data();

      const transporter = await db
        .collection("users")
        .doc(req.body.transporterId)
        .get();
      const transporterData = await transporter.data();
      
      const receiverFcmToken = await getReceiverFcmToken(orderData.drop_location, user.data()?.phone_number);
      if(receiverFcmToken) userFcmToken.push(receiverFcmToken);

      const tFirstName = await transporterData.first_name;
      const tLastName = await transporterData.last_name;
      const orderNo = await orderData.order_id;
      ntitle = "Transporter Unavailable";
      nbody = formatNotificationMessage({
        dynamicValues: {
          transporterName: `${tFirstName} ${tLastName}`,
          orderID: orderNo
        },
        text
      })
      orderId = req.body.orderId;
    } else if (req.body.type == "request") {
      userId = req.body.userId;
      if (req.body.userId == "" || req.body.userId == undefined) {
        return res.status(400).send({ message: "User id is required." });
      }

      const user = await db.collection("users").doc(req.body.userId).get();
      userFcmToken.push(await user.data().fcm_token);
      
      const order = await db
        .collection("order_details")
        .doc(req.body.orderId)
        .get();
      const orderData = await order.data();

      // const receiverFcmToken = await getReceiverFcmToken(orderData.drop_location, user.data()?.phone_number);
      // if(receiverFcmToken) userFcmToken.push(receiverFcmToken);

      ntitle = "New Shipment Request";
      nbody = `${text}`;
      orderId = "";
      checkIfTransporterAccepted(req.body, userFcmToken);
    } else if (req.body.type == "assign_driver") {
      userId = req.body.userId;
      if (req.body.orderId == "" || req.body.orderId == undefined) {
        return res.status(400).send({ message: "Order id is required." });
      } else if (req.body.orderId == "" || req.body.orderId == undefined) {
        return res.status(400).send({ message: "Order id is required." });
      }

      const user = await db.collection("users").doc(req.body.userId).get();
      userFcmToken.push(await user.data().fcm_token);

      const order = await db
        .collection("order_details")
        .doc(req.body.orderId)
        .get();
      const orderData = await order.data();

      const receiverFcmToken = await getReceiverFcmToken(orderData.drop_location, user.data()?.phone_number);
      if(receiverFcmToken) userFcmToken.push(receiverFcmToken);

      const tFirstName = await orderData.transporter_details.first_name;
      const tLastName = await orderData.transporter_details.last_name;
      const orderNo = await orderData.order_id;
      const tPhoneNumber = await orderData.transporter_details.phone_number;
      ntitle = "Shipment Assignment";
      nbody = formatNotificationMessage({
        dynamicValues: {
          transporterName: `${tFirstName} ${tLastName}`,
          transporterPhoneNumber: tPhoneNumber,
          trackingID: orderNo
        },
        text
      })
      orderId = req.body.orderId;
    } else if (req.body.type == "started") {
      userId = req.body.userId;
      orderId = req.body.orderId;
      if (orderId == "" || orderId == undefined) {
        return res.status(400).send({ message: "Order id is required." });
      }
      const user = await db.collection("users").doc(req.body.userId).get();
      userFcmToken.push(await user.data().fcm_token);
      const order = await db
        .collection("order_details")
        .doc(orderId)
        .get();
      const orderData = await order.data();
      
      const receiverFcmToken = await getReceiverFcmToken(orderData.drop_location, user.data()?.phone_number);
      if(receiverFcmToken) userFcmToken.push(receiverFcmToken);

      const orderNo = await orderData.order_id;

      ntitle = "Shipment Dispatched";
      nbody = formatNotificationMessage({
        dynamicValues: {
          customerName: `${orderData.created_by.first_name} ${orderData.created_by.last_name}`,
          trackingID: orderNo
        },
        text
      })
      orderId = orderId;
    } else if (req.body.type == "on-way") {
      userId = req.body.userId;
      if (req.body.userId == "" || req.body.userId == undefined) {
        return res.status(400).send({ message: "User id is required." });
      }
      
      const user = await db.collection("users").doc(req.body.userId).get();
      userFcmToken.push(await user.data().fcm_token);
      const dd = await user.data()
      const order = await db
        .collection("order_details")
        .doc(req.body.orderId)
        .get();
      const orderData = await order.data();
      
      const receiverFcmToken = await getReceiverFcmToken(orderData.drop_location, user.data()?.phone_number);
      if(receiverFcmToken) userFcmToken.push(receiverFcmToken);

      const dFirstName = await orderData.driver_details.first_name;
      const dLastName = await orderData.driver_details.last_name;
      const orderNo = await orderData.order_id;
      ntitle = "Driver On Route";
      nbody = formatNotificationMessage({
        dynamicValues: {
          driverName: `${dFirstName} ${dLastName}`,
          trackingID: orderNo
        },
        text
      })
      orderId = req.body.orderId;
    } else if (req.body.type == "unloading") {
      userId = req.body.userId;
      if (req.body.userId == "" || req.body.userId == undefined) {
        return res.status(400).send({ message: "User id is required." });
      }

      const user = await db.collection("users").doc(req.body.userId).get();
      userFcmToken.push(await user.data().fcm_token);

      const order = await db
        .collection("order_details")
        .doc(req.body.orderId)
        .get();
      const orderData = await order.data();
      
      const receiverFcmToken = await getReceiverFcmToken(orderData.drop_location, user.data()?.phone_number);
      if(receiverFcmToken) userFcmToken.push(receiverFcmToken);

      const dFirstName = await orderData.driver_details.first_name;
      const dLastName = await orderData.driver_details.last_name;
      const orderNo = await orderData.order_id;
      ntitle = "Unloading in Progress";
      nbody = formatNotificationMessage({
        dynamicValues: {
          driverName: `${dFirstName} ${dLastName}`,
          trackingID: orderNo
        },
        text
      })
      orderId = req.body.orderId;
    } else if (req.body.type == "dispute") {
      userId = req.body.userId;
      if (req.body.userId == "" || req.body.userId == undefined) {
        return res.status(400).send({ message: "User id is required." });
      }
      const user = await db.collection("users").doc(req.body.userId).get();
      userFcmToken.push(await user.data().fcm_token);

      const order = await db
        .collection("order_details")
        .doc(req.body.orderId)
        .get();
      const orderData = await order.data();
      
      const receiverFcmToken = await getReceiverFcmToken(orderData.drop_location, user.data()?.phone_number);
      if(receiverFcmToken) userFcmToken.push(receiverFcmToken);

      const dFirstName = await orderData.driver_details.first_name;
      const dLastName = await orderData.driver_details.last_name;
      const orderNo = await orderData.order_id;
      ntitle = "Dispute Alert";
      nbody = formatNotificationMessage({
        dynamicValues: {
          driverName: `${dFirstName} ${dLastName}`,
          trackingID: orderNo
        },
        text
      })
      orderId = req.body.orderId;
    }

    const notification = {
      type: req.body.type,
      is_read: false,
      text: nbody,
      created_at: new Date(),
      user_id: userId,
      title: ntitle,
      orderId: orderId,
    };

    // const fireToken = [userFcmToken];
    const fireToken = userFcmToken;

    let obj = {
      title: ntitle,
      body: nbody,
      date: new Date().toISOString(),
      type: req.body.type,
      orderId: orderId,
      badge: "0",
      sound: "default",
    };
    const payload = {
      data: obj,
      notification: obj,
    };

    messaging
      .sendToDevice(fireToken, payload)
      .then(function (response) {
        // console.log("Have Permission******", response);
        // console.log("PAYLOAD******", payload);
        return response;
      })
      .catch(function (err) {
        console.log(err);
        console.log("Error occured", err);
      });

    await db.collection("notification").add(notification);
    return res
      .status(200)
      .send({ message: "Notification send successfully...!!" });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: error.message });
  }
};

exports.sendAdminNotification = async (transporter_id, driver_id, type) => {
  let ntitle,
    nbody,
    driverId,
    userId,
    userFcmToken = [],
    text;
  if (!type) {
    return res.status(400).send({ message: "Notification type required." });
  }

  const getTypeText = await db.collection("notification_type").get();
  getTypeText.forEach((item) => {
    if (item.data().type === type) {
      text = item.data().text;
    }
  });
  if (type == "verified") {
    userId = transporter_id;
    if (transporter_id == "" || transporter_id == undefined) {
      return res.status(400).send({ message: "Transporter id is required." });
    } else if (driver_id == "" || driver_id == undefined) {
      return res.status(400).send({ message: "Driver id is required." });
    } else {
      const getTransporterById = await db
        .collection("users")
        .doc(transporter_id);
      const transporter = await getTransporterById.get();
      userFcmToken.push(await transporter.data().fcm_token);
      // console.log("Transporter*****", await transporter.data());

      if (transporter_id === driver_id) {
        const getDrivers = await getTransporterById
          .collection("driver_details")
          .get();

        let id = null;
        getDrivers.forEach((doc) => {
          if (driver_id == doc.data().user_uid) {
            id = doc.id;
          }
        });
        const getDriverId = await getTransporterById
          .collection("driver_details")
          .doc(id);
        const driver = await getDriverId.get();
        const dFirstName = await driver.data().first_name;
        const dLastName = await driver.data().last_name;
        const driverName = `${dFirstName} ${dLastName}`;

        ntitle = "Driver Verified";
        nbody = formatNotificationMessage({
          dynamicValues: {
            driverName
          },
          text
        })
        driverId = transporter_id;
      } else {
        const driver = await db.collection("users").doc(driver_id).get();

        const dFirstName = await driver.data().first_name;
        const dLastName = await driver.data().last_name;
        const driverName = `${dFirstName} ${dLastName}`;

        ntitle = "Driver Verified";
        nbody = `${text.slice(0, 14)} ${driverName}${text.slice(14)}`;
        driverId = driver_id;
      }
    }
  } else if (type == "rejected") {
    userId = transporter_id;
    if (transporter_id == "" || transporter_id == undefined) {
      return res.status(400).send({ message: "Transporter id is required." });
    } else if (driver_id == "" || driver_id == undefined) {
      return res.status(400).send({ message: "Driver id is required." });
    } else {
      const getTransporterById = await db
        .collection("users")
        .doc(transporter_id);
      const transporter = await getTransporterById.get();
      userFcmToken.push(await transporter.data().fcm_token);
      // console.log("Transporter*****", await transporter.data());

      if (transporter_id === driver_id) {
        const getDrivers = await getTransporterById
          .collection("driver_details")
          .get();

        let id = null;
        getDrivers.forEach((doc) => {
          if (driver_id == doc.data().user_uid) {
            id = doc.id;
          }
        });
        const getDriverId = await getTransporterById
          .collection("driver_details")
          .doc(id);
        const driver = await getDriverId.get();
        const dFirstName = await driver.data().first_name;
        const dLastName = await driver.data().last_name;
        const driverName = `${dFirstName} ${dLastName}`;

        ntitle = "Driver is not verified";
        nbody = `${text.slice(0, 40)} ${driverName}${text.slice(40)}`;
        driverId = transporter_id;
      } else {
        const driver = await db.collection("users").doc(driver_id).get();

        const dFirstName = await driver.data().first_name;
        const dLastName = await driver.data().last_name;
        const driverName = `${dFirstName} ${dLastName}`;

        ntitle = "Driver is not verified";
        nbody = `${text.slice(0, 40)} ${driverName}${text.slice(40)}`;
        driverId = driver_id;
      }
    }
  }

  const notification = {
    type: type,
    is_read: false,
    text: nbody,
    created_at: new Date(),
    user_id: userId,
    title: ntitle,
    driverId: driverId,
  };

  // const fireToken = [userFcmToken];
  const fireToken = userFcmToken;

  let obj = {
    title: ntitle,
    body: nbody,
    date: new Date().toISOString(),
    type: type,
    driverId: driverId,
    badge: "0",
    sound: "default",
  };
  const payload = {
    data: obj,
    notification: obj,
  };

  messaging
    .sendToDevice(fireToken, payload)
    .then(function (response) {
      console.log("Have Permission******", response);
      console.log("PAYLOAD******", payload);
      return response;
    })
    .catch(function (err) {
      console.log("Error occured", err);
    });

  await db.collection("notification").add(notification);
};

exports.listNotifications = async (req, res) => {
  const notifications = [];

  const currentUser = firebase.auth().currentUser;

  let admin;

  if (currentUser != null) {
    const userUid = currentUser.uid;
    await db.collection("users").doc(userUid).update({ noti_count: 0 });
    const user = await db.collection("users").doc(userUid).get();
    admin = await user.data();
  }

  const data = await db
    .collection("notification")
    .orderBy("created_at", "desc")
    .get();
  data.forEach((doc) => {
    if (doc.data().type === "new_driver" && doc.data().is_read === false) {
      const notification = {
        id: doc.id,
        notificationData: doc.data(),
      };
      notifications.push(notification);
    }
  });

  return res.json({
    notifications: notifications,
    admin: admin,
  });
};

exports.notificationCount = async (req, res) => {
  try {
    const currentUser = firebase.auth().currentUser;

    let admin = null;

    if (currentUser != null) {
      const userUid = currentUser.uid;
      const user = await db.collection("users").doc(userUid).get();
      const userAdmin = user.data();

      let status = null;
      if (userAdmin.status === true) {
        status = "Active";
      } else {
        status = "In-active";
      }

      admin = { userAdmin, status };
      return res.json({ admin: admin });
    }
  } catch (error) {
    let errors = [];
    errors.push({ msg: error.code });
    return res.json({ errors });
  }
};

exports.notificationRead = async (req, res) => {
  try {
    await db
      .collection("notification")
      .doc(req.query.notiId)
      .update({ is_read: true });
    return res.json({ msg: "Notification is read already...!!" });
  } catch (error) {
    let errors = [];
    errors.push({ msg: error.code });
    return res.json({ errors });
  }
};
