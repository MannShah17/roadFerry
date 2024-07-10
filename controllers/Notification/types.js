const { db } = require("../../config/admin");
const { getReceiverFcmToken } = require("./notification");

const requiredData = {
    "accept": {userData: true, orderData: true}
}

const notificationTypes = async (req, res, type) => {

    if(!type) throw new Error("Type not specified")

    const userFcmToken = [];

    const userId = req.body.userId;
    const {userData: requireUserData, orderData: requireOrderData} = requiredData[type];
    if (requireUserData && (req.body.userId == "" || req.body.userId == undefined)) {
      return res.status(400).send({ message: "User id is required." });
    } else if (requireOrderData && (req.body.orderId == "" || req.body.orderId == undefined)) {
      return res.status(400).send({ message: "Order id is required." });
    }
    
    const user = requireUserData && await db.collection("users").doc(req.body.userId).get();
    const userData = user ? await user.data() : {};
    userFcmToken.push(await userData.fcm_token);

    const order = requireOrderData && await db
      .collection("order_details")
      .doc(req.body.orderId)
      .get();
    const orderData = order ? await order.data() : {};
    
    const receiverFcmToken = await getReceiverFcmToken(orderData?.drop_location, userData?.phone_number);
    if(receiverFcmToken) userFcmToken.push(receiverFcmToken);
}

const accept = async (req, res, ) => {
    
    const tFisrtName = await orderData.transporter_details?.first_name;
    const tLastName = await orderData.transporter_details?.last_name;
    const tPhoneNumber = await orderData.transporter_details?.phone_number;
    ntitle = "Transporter Confirmed";
    nbody = `${tFisrtName} ${tLastName} (${tPhoneNumber}) ${text} ${orderData.order_id}`;
    orderId = req.body.orderId;

    return {
        ntitle,
        nbody,
        orderId,
        userFcmToken
    }
}

module.exports = {
    notificationTypes
}