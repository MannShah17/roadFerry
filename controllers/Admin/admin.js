const {
  db,
  firebaseSecondaryApp,
  firebase,
  messaging,
} = require("../../config/admin");
// importScripts("https://www.gstatic.com/firebasejs/4.13.0/firebase-app.js");
// importScripts(
//   "https://www.gstatic.com/firebasejs/4.13.0/firebase-messaging.js"
// );
const { validateAdminData } = require("./adminHelper");

/* Create a new Admin Controller */
exports.newAdmin = async (req, res) => {
  try {
    // messaging
    //   .requestPermission()
    //   .then(function () {
    //     // MsgElem.innerHTML = "Notification permission granted.";
    //     console.log("Notification permission granted.");
    //     // get the token in the form of promise
    //     return messaging.getToken();
    //   })
    //   .then(function (token) {
    //     // print the token on the HTML page
    //     console.log("token is : ", token);
    //   })
    //   .catch(function (err) {
    //     // ErrElem.innerHTML = ErrElem.innerHTML + "; " + err;
    //     console.log("Unable to get permission to notify.", err);
    //   });
    // messaging.onMessage(function (payload) {
    //   console.log("OnMessage:", payload);
    // });
    // messaging
    //   .getToken({
    //     vapidKey:
    //       "BBBrOLIqdpBfi2k450IBiThfbqBxfWmHcOQ9UYYUiBqDcLBlMgCqrkB2_Zq6crUk2kvypCxXdLnU-5scdg5jjco",
    //   })
    //   .then((fcmToken) => {
    //     if (fcmToken) {
    //       console.log("FCM TOKEN*******", fcmToken);
    //     } else {
    //       console.log("[FCMService] User does not have a device token");
    //     }
    //   })
    //   .catch((error) => {
    //     console.log("[FCMService] getToken rejected", error);
    //   });
    const adminData = {
      email: req.body.email,
      password: req.body.password,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      phone: req.body.phone,
      documentType: req.body.documentType,
      // status: req.body.status,
    };
    const { valid, errors } = validateAdminData(adminData);
    if (!valid) {
      return res.render("Users/Admin/addAdmin", {
        errors,
      });
    } else {
      let newAdmin;
      try{
        newAdmin = await firebaseSecondaryApp
          .auth()
          .createUserWithEmailAndPassword(adminData.email, adminData.password);
      }
      catch(error){
        if (error.code == "auth/email-already-in-use") {
          const userQuerySnapshot = await db.collection("users")
          .where("email","==",adminData.email)
          .where("user_type","==","admin")
          .where("is_deleted","==",true)
          .get();
          const userDoc = await userQuerySnapshot?.docs[0];
          const userDocData = await userDoc?.data();
          if(userDoc && userDocData){
            await db.collection("users").doc(userDoc.id).update({
              is_deleted: false
            });
            return res.render("Users/Admin/addAdmin", {
              success_msg: "An admin account with provided email address is already present with deleted state, and the account has been moved to active state.",
            });
          }
          else throw error;
        }
      }
      // let status = null;
      // if (adminData.status == "true") {
      //   status = Boolean(!!adminData.status);
      // } else {
      //   status = Boolean(!adminData.status);
      // }
      const data = {
        first_name: adminData.firstname,
        last_name: adminData.lastname,
        email: adminData.email,
        phone_number: adminData.phone,
        user_type: "admin",
        photo: "",
        status: true,
        created_at: new Date(),
        is_deleted: false,
      };
      await db.collection("users").doc(newAdmin.user.uid).set(data);
      await db
        .collection("users")
        .doc(newAdmin.user.uid)
        .collection("documents")
        .add({ type: adminData.documentType, url: "", updated_at: new Date() });
      firebaseSecondaryApp.auth().signOut();
      return res.render("Users/Admin/addAdmin", {
        message: "Admin is created...!!",
      });
    }
  } catch (error) {
    const errors = [];
    if (error.code == "auth/email-already-in-use") {
      errors.push({ msg: "Email already exists!" });
      return res.render("Users/Admin/addAdmin", {
        errors,
      });
    }
    errors.push({ msg: error.message });
    return res.render("Users/Admin/addAdmin", { errors });
  }
};

/* Get All the Admins Controller */
exports.listAdmins = async (req, res) => {
  try {
    const admins = [];
    const data = await db.collection("users").orderBy('created_at', 'desc').get();
    data.forEach((doc) => {
      if (
        (doc.data().user_type == "Admin" || doc.data().user_type == "admin") &&
        doc.data().is_deleted === false
      ) {
        const admin = { id: doc.id, adminData: doc.data() };
        admins.push(admin);
      }
    });
    res.render("Users/Admin/displayAdmins", { admins: admins });
  } catch (error) {
    return res.render({ error: error.code });
  }
};

/* Remove an Admin Controller */
exports.removeAdmin = async (req, res) => {
  try {
    const id = req.params.admin_id;
    // console.log("*****ID*****", id);

    const getAdminById = await db.collection("users").doc(id);
    const adminData = await getAdminById.get();
    const admin = await adminData.data();
    // console.log("*****ADMIN DATA*****", admin);

    if (admin === undefined) {
      errors.push({ msg: "Admin not found...!!" });
      res.render("Errors/errors", { errors: errors });
    }

    const updateData = {
      reason: req.body.reason,
      is_deleted: true,
    };

    const deletedData = {
      type: "users",
      id: await db.doc("users/" + id),
      user_id: await firebase.auth().currentUser?.uid,
      deleted_at: new Date(),
    };

    await getAdminById.update(updateData);
    await db.collection("deletion_logs").add(deletedData);

    return res.redirect("back");

    // const batch = db.batch();
    // const data = await db
    //   .collection("users")
    //   .doc(id)
    //   .collection("documents")
    //   .get();

    // data.forEach((doc) => {
    //   batch.delete(doc.ref);
    // });
    // await batch.commit();

    // await db.collection("users").doc(id).delete();

    // await firebase.auth().deleteUser(uid);
    // console.log("USER IS DELETED");
    // res.redirect("/admin/displayAdmins");
  } catch (error) {
    const errors = [];
    console.log(error);
    errors.push({ msg: error.message });
    return res.render("Errors/errors", {
      errors: errors,
    });
    // res.status(400).json({ error: error.code });
  }
};

/* Get Admin details Controller */
exports.adminDetails = async (req, res) => {
  try {
    const errors = [];
    const id = req.params.admin_id;

    const data = await db.collection("users").doc(id).get();
    if (data.data() === undefined) {
      errors.push({ msg: "Admin not found...!!" });
      return res.render("Errors/errors", { errors: errors });
    }
    const adminData = data.data();

    return res.render("Users/Admin/adminDetails", {
      admin: adminData,
    });
  } catch (error) {
    const errors = [];
    errors.push({ msg: error.message });
    return res.render("Errors/errors", { errors: errors });
  }
};

/* Change Admin's Status Controller */
exports.changeAdminStatus = async (req, res) => {
  const errors = [];
  const id = req.params.admin_id;

  try {
    const getAdminById = await db.collection("users").doc(id);
    const adminData = await getAdminById.get();
    const admin = await adminData.data();

    if (admin == undefined) {
      errors.push({ msg: "There is no data available" });
      return res.render("Users/Admin/displayAdmins", {
        errors: errors,
      });
    }

    const Status = {
      status: !admin.status,
    };

    const updateData = {
      reason: req.body.reason,
      type: "users",
      id: await db.doc("users/" + id),
      user_id: await firebase.auth().currentUser.uid,
      updated_at: new Date(),
      status: Status.status,
    };

    await getAdminById.update(Status);
    await db.collection("status_logs").add(updateData);

    return res.redirect("/transporter/list");
  } catch (error) {
    console.log(error);
    errors.push({ msg: error.message });
    return res.render("Errors/errors", {
      errors: errors,
    });
  }
};
