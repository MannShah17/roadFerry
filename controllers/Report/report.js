const { db } = require("../../config/admin");
const moment = require("moment");

exports.registerUserReport = async (req, res) => {
  let counter = 0;
  if (req.query.start && req.query.end) {
    var st = new Date(req.query.start);
    var e = new Date(req.query.end);

    let startDate = moment(st, "YYYY-MM-DD").format("MM-DD-YYYY") + " 00:00:00";
    let endDate = moment(e, "YYYY-MM-DD").format("MM-DD-YYYY") + " 23:59:59";

    let getUsers = await db.collection("users");
    let users = await getUsers.get();

    users.forEach((doc) => {
      if (doc && doc.data() && doc.data().created_at) {
        let userDate = doc.data().created_at.toDate();
        let date = moment(userDate).format("MM-DD-YYYY");
        if (date >= startDate && date <= endDate) {
          counter++;
        }
      }
    });
    return res.json({ counter: counter });
  }
};

exports.orderReport = async (req, res) => {
  let completedCnt = 0,
    pendingCnt = 0,
    rejectedCnt = 0,
    ongoingCnt = 0;

  if (req.query.start && req.query.end) {
    var st = new Date(req.query.start);
    var e = new Date(req.query.end);

    console.log("START and END", st, e);

    let startDate = moment(st, "YYYY-MM-DD").format("MM-DD-YYYY") + " 00:00:00";
    let endDate = moment(e, "YYYY-MM-DD").format("MM-DD-YYYY") + " 23:59:59";

    let getOrders = await db.collection("order_details");
    let orders = await getOrders.get();

    orders.forEach((doc) => {
      let orderDate = doc.data().created_at.toDate();
      let date = moment(orderDate).format("MM-DD-YYYY");
      if (date >= startDate && date <= endDate) {
        if (doc.data().status == "completed") {
          completedCnt++;
        } else if (doc.data().status == "pending") {
          pendingCnt++;
        } else if (doc.data().status == "rejected") {
          rejectedCnt++;
        } else if (doc.data().status == "assigned" || doc.data().status == "on-way") {
          ongoingCnt++;
        }
      }
    });

    let orderCompleted = {
      label: "Completed",
      cnt: completedCnt,
    };

    let orderPending = {
      label: "Pending",
      cnt: pendingCnt,
    };

    let orderRejected = {
      label: "Rejected",
      cnt: rejectedCnt,
    };

    let orderOngoing = {
      label: "Ongoing",
      cnt: ongoingCnt,
    };

    return res.json({
      orderCompleted: orderCompleted,
      orderPending: orderPending,
      orderRejected: orderRejected,
      orderOngoing: orderOngoing,
    });
  }
};
