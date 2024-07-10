const { firebase, db } = require("../../config/admin");
const {
  validateSignInData,
  validateForgetPasswordData,
  validateChangePasswordData,
} = require("./authHelper");
// const User = require("../../models/auth");

/* SignIn Controller */
exports.signIn = async (req, res) => {
  console.log(req.body)
  try {
    const user = {
      email: req.body.email,
      password: req.body.password,
    };

    const { valid, errors } = validateSignInData(user)

    if (!valid) {
      console.log("error1")
      return res.status(400).json(errors);
    }

    // const data = await firebase
    //   .auth()
    //   .signInWithEmailAndPassword(user.email, user.password);

    // const token = await data.user.getIdToken();

    // if (token) {
    //   res.redirect("/dashboard");
    // }

    let userEmail = null;
    let isDeletedUser = false;
    const usersData = await db.collection("users").get();
    usersData.forEach((doc) => {
      if (
        doc.data().email == user.email &&
        (doc.data().user_type == "Admin" || doc.data().user_type == "admin")
      ) {
        isDeletedUser = doc.data().is_deleted;
        userEmail = doc.data().email;
      }
    });

    if(isDeletedUser){
      return res.status(404).json("User not found (or) is deleted");
    }

    if (user.email == userEmail) {
      const result = await firebase
        .auth()
        .signInWithEmailAndPassword(user.email, user.password);

      res.cookie('userId',result.user.uid, { maxAge: 86400000, httpOnly: true });
      res.redirect("/dashboard");
    } else {
      console.log("error2")
      const errors = "Wrong credentials"      
            // return res.render('Pages/pages-login', { errors:errors } );
      // res.redirect("/");
      return res.status(400).send( errors);
    }
  } catch (error) {
    if (error.code == "auth/invalid-email") {
      console.log("error3")
      return res.status(403).json("Please enter the valid email ID");
    }
    if (
      error.code == "auth/wrong-password" ||
      error.code == "auth/user-not-found"
    ) {
      console.log("error4")
      return res
        .status(403)
        .json({ message: "Wrong credentials, Please try again" });
    }
    console.log("error5", error)
    return res.status(500).json({ error: error.code });
  }
};

/* SignOut Controller */
exports.signOut = async (req, res) => {
  try {
    res.clearCookie("userId");
    await firebase.auth().signOut();
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
};

/* Forget Password Controller */
exports.forgetPassword = async (req, res) => {
  try {
    const userEmail = { email: req.body.email };

    const { valid, errors } = validateForgetPasswordData(userEmail);

    if (!valid) {
      // res.render("Pages/pages-recoverpw", { errors: errors });
      return res.status(400).json(errors);
    }

    await firebase.auth().sendPasswordResetEmail(userEmail.email);
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
};

/* Get Current signed in User Function */
const getCurrentUser = () => {
  try {
    let currentUser = null;
    currentUser = firebase.auth().currentUser;
    return currentUser;
  } catch (error) {
    console.log(error);
  }
};

/* Change Password Controller */
exports.changePassword = async (req, res) => {
  try {
    const passwords = {
      password: req.body.password,
      newPassword: req.body.newPassword,
    };

    const { valid, errors } = validateChangePasswordData(passwords);

    if (!valid) {
      res.render("Pages/change-password", {
        errors,
      });
    }

    const currentUser = getCurrentUser();
    if (currentUser != null) {
      await currentUser.updatePassword(passwords.password);
    }
    await firebase.auth().signOut();
    res.redirect("/");
  } catch (error) {
    let errors = [];
    errors.push({ msg: error.message });
    res.render("Pages/change-password", { errors: errors });
  }
};

/* Get Profile of Signed In User Controller */
exports.profile = async (req, res) => {
  try {
    const currentUser = getCurrentUser();

    let errors = [];
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
      return res.render("Pages/profile", { admin: admin });
    }
    errors.push({ msg: "This user is not available..!!" });
    return res.render("Pages/pages-error", { errors });
  } catch (error) {
    let errors = [];
    errors.push({ msg: error.code });
    return res.render("Pages/pages-error", { errors });
  }
};

/* Get Profile of Signed In User Controller */
exports.updateProfile = async (req, res) => {
  try {
    const currentUser = getCurrentUser();

    let errors = [];
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
      return res.render("Pages/update-profile", { admin: admin });
    }
    errors.push({ msg: "This user is not available..!!" });
    return res.render("Pages/pages-error", { errors });
  } catch (error) {
    let errors = [];
    errors.push({ msg: error.code });
    return res.render("Pages/pages-error", { errors });
  }
};

/* Get Profile of Signed In User Controller */
exports.updatedProfile = async (req, res) => {
  try {
    const currentUser = getCurrentUser();

    let data = {
      first_name: req.body.firstName,
      last_name: req.body.lastName,
      phone_number: req.body.phone,
    };

    if (currentUser != null) {
      const userUid = currentUser.uid;
      const admin = await db.collection("users").doc(userUid);

      await admin.update(data);

      return res.redirect("/profile");
    }
    errors.push({ msg: "This user is not available..!!" });
    return res.render("Pages/update-profile", { errors });
  } catch (error) {
    let errors = [];
    errors.push({ msg: error.code });
    return res.render("Pages/update-profile", { errors });
  }
};
