const { db, firebase } = require("../../config/admin");

/* Get All the Customers Controller */
exports.listCustomers = async (req, res) => {
  try {
    const customers = [];
    const data = await db.collection("users").get();
    data.forEach((doc) => {
      if (
        (doc.data().user_type == "Customer" ||
          doc.data().user_type == "customer") &&
        doc.data().is_deleted === false
      ) {
        const customer = { id: doc.id, customerData: doc.data() };
        customers.push(customer);
      }
    });
    res.render("Users/Customer/displayCustomers", { customers: customers });
  } catch (error) {
    const errors = [];
    errors.push({ msg: error.message });
    return res.render("Users/Customer/displayCustomers", {
      errors: errors,
    });
  }
};

/* Get Customer's Details Controller */
exports.customerDetails = async (req, res) => {
  try {
    const errors = [];
    const id = req.params.customer_id;
    // console.log("*****ID*****", id);

    const data = await db.collection("users").doc(id).get();
    if (!data.data() == undefined) {
      errors.push({ msg: "There are no data available" });
      res.render("User/Customer/displayCutomers", { errors: errors });
    } else {
      const orders = [];

      let customer = { id: data.id, customerData: data.data() };
      let getOrders = await db.collection("order_details").get();

      getOrders.forEach(async (doc) => {
        if (doc.data().requested_uid == id) {
          const order = {
            id: doc.id,
            orderData: doc.data(),
            requested_id: id,
          };
          orders.push(order);
        }
      });
      res.render("Users/Customer/customerDetails", {
        customer: customer,
        orders: orders,
      });
    }
  } catch (error) {
    const errors = [];
    errors.push({ msg: error.message });
    return res.render("Users/Customer/customerDetails", {
      errors: errors,
    });
  }
};

/* Change Customer's Status Controller */
exports.changeCustomerStatus = async (req, res) => {
  try {
    const id = req.params.customer_id;
    const userData = await db.collection("users").doc(id);
    const getUserData = await userData.get();
    const data = await getUserData.data();

    let status = null;
    if (getUserData) {
      status = !data.status;
    }
    await userData.update({ status });
    res.redirect("/customer/list");
  } catch (error) {
    console.log(error);
  }
};

/* Remove a customer Controller */
exports.removeCustomer = async (req, res) => {
  try {
    const errors = [];
    const id = req.params.customer_id;
    // console.log("HELLO YOU ARE IN DELETE API OF CUSTOMER");
    // console.log("DATA", data);
    // console.log("ID", id);

    const userData = await db.collection("users").doc(id);

    const updateData = {
      reason: req.body.reason,
      is_deleted: true,
      status: false,
    };

    if (!userData) {
      errors.push({ msg: "There are no data available" });
      res.render("User/Customer/displayCutomers", { errors: errors });
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
    await userData.update(updateData);
    // console.log("DELETED DATA", deletedData);

    await db.collection("deletion_logs").add(deletedData);

    res.redirect("/customer/list");
  } catch (error) {
    console.log(error);
  }
};
