const { db } = require("../../config/admin");
const moment = require("moment");

/* Function to count every user-type */
const userCounter = async () => {
  try {
    let cntTransporter = {};
    let cntCustomer = {};
    let cntDriver = {};
    let cntAdmin = {};

    const transporters = [];
    const customers = [];
    const drivers = [];
    const admins = [];

    const users = await db.collection("users").get();
    users.forEach((doc) => {
      if (
        (doc.data().user_type == "Transporter" ||
          doc.data().user_type == "transporter") &&
        doc.data().is_deleted == false
      ) {
        transporters.push(doc.data());
      } else if (
        (doc.data().user_type == "Admin" || doc.data().user_type == "admin") &&
        doc.data().is_deleted == false
      ) {
        admins.push(doc.data());
      } else if (
        (doc.data().user_type == "Customer" ||
          doc.data().user_type == "customer") &&
        doc.data().is_deleted == false
      ) {
        customers.push(doc.data());
      } else if (
        (doc.data().user_type == "Driver" ||
          doc.data().user_type == "driver") &&
        doc.data().is_deleted == false
      ) {
        drivers.push(doc.data());
      }
    });

    cntTransporter = {
      counter: transporters.length,
      heading: "Transporters",
      icon: "mdi mdi-truck",
      link:'/transporter/list'
    };
    cntDriver = {
      counter: drivers.length,
      heading: "Drivers",
      icon: "mdi mdi-seat-recline-normal",
      link:"driver/list" 
    };
    cntCustomer = {
      counter: customers.length,
      heading: "Customers",
      icon: "mdi mdi-account-multiple",
      link:"customer/list"
    };
    cntAdmin = {
      counter: admins.length,
      heading: "Admins",
      icon: "mdi mdi-account-star-variant",
      link:"/admin/list"
    };

    return { cntAdmin, cntTransporter, cntDriver, cntCustomer };
  } catch (error) {
    console.log(error);
  }
};

/*  Function to count Order */
const orderCounter = async () => {
  try {
    let cntPendingOrder = {};
    let cntOnGoingOrder = {};
    let cntCompleteOrder = {};
    let cntRejectedOrder = {};

    const pendingOrder = [];
    const onGoingOrder = [];
    const completeOrder = [];
    const rejectedOrder = [];

    const orders = await db.collection("order_details").get();
    orders.forEach((doc) => {
      if (doc.data().status == "pending" || doc.data().status == "Pending") {
        pendingOrder.push(doc.data());
      } else if (
        doc.data().status == "assigned" ||
        doc.data().status == "on-way"
      ) {
        onGoingOrder.push(doc.data());
      } else if (
        doc.data().status == "completed" ||
        doc.data().status == "Completed"
      ) {
        completeOrder.push(doc.data());
      } else if (
        doc.data().status == "rejected" ||
        doc.data().status == "Rejected"
      ) {
        rejectedOrder.push(doc.data());
      }
    });

    cntPendingOrder = {
      counter: pendingOrder.length,
      heading: "Pending  Orders",
      icon: "mdi mdi-cart",
      link:"/order/list"
    };
    cntOnGoingOrder = {
      counter: onGoingOrder.length,
      heading: "Ongoing Orders",
      icon: "mdi mdi-cart",
      link:"/order/list"
    };
    cntCompleteOrder = {
      counter: completeOrder.length,
      heading: "Completed Orders",
      icon: "mdi mdi-cart",
      link:"/order/list"
    };
    cntRejectedOrder = {
      counter: rejectedOrder.length,
      heading: "Rejected Orders",
      icon: "mdi mdi-cart-off",
      link:"/order/list"
    };

    return {
      cntPendingOrder,
      cntOnGoingOrder,
      cntCompleteOrder,
      cntRejectedOrder,
    };
  } catch (error) {
    console.log(error);
  }
};

// /* Function to get register user count report */
// const registerUserReport = () => {
//   if (req.query.start && req.query.end) {
//     var st = new Date(req.query.start);
//     var e = new Date(req.query.end);
//     console.log("START*****", st);
//     console.log("END*****", e);
//   }
// };

/* Dashboard Controller */
exports.dashboard = async (req, res) => {
  try {
    let data = [];
    let orderByStatus = [];
    let userCnt = 0;

    let getUsers = await db.collection("users").get();
    getUsers.forEach((doc) => {
      userCnt++;
    });

    let users = await userCounter();
    Object.values(users).forEach((val) => {
      data.push(val);
    });

    let orders = await orderCounter();
    Object.values(orders).forEach((val) => {
      data.push(val);
      orderByStatus.push(val);
    });

    res.render("Dashboard/dashboard1", {
      data: data,
      orders: orderByStatus,
      userCnt: userCnt,
    });
  } catch (error) {
    console.log(error);
  }
};
