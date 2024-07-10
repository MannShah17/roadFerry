var express = require("express");
var router = express.Router();

const {
  signIn,
  signOut,
  forgetPassword,
  changePassword,
  profile,
  updateProfile,
  updatedProfile,
} = require("../controllers/Auth/auth");
// const { newDriver } = require("../controllers/Driver/driver");
const { isAuthenticated } = require("../middleware/authGaurd");
const { dashboard } = require("../controllers/Dashboard/dashboard");
const {
  sendNotification,
  sendAdminNotification,
  listNotifications,
  notificationCount,
  notificationRead,
} = require("../controllers/Notification/notification");
const { db } = require("../config/admin");
const {
  registerUserReport,
  orderReport,
} = require("../controllers/Report/report");
const driverRouter = require("./driverRouter");

// Router For Notification
router.post("/api/sendNotification", sendNotification);
router.post("/api/sendAdminNotification", sendAdminNotification);

// Routes for Signup, Signin and Signout
router.post("/", signIn);

router.get("/logout", signOut);
router.get("/driver",driverRouter);
router.post("/driver",driverRouter);

// Routes for Forget Password
router.post("/forget-password", forgetPassword);

// //  Routes for Driver
// router.get("/transporter/:transporter_id/createDriver", (req, res) => {
//   res.render("Users/Driver/addDriver");
// });

// // router.post("/transporter/:transporter_id/createDriver", newDriver);

// router.get("/displayDrivers");

// // Routes for Vehicle
// // router.get("/transporter/:transporter_id/createVehicle", (req, res) => {
// //   res.render("Vehicle/addVehicle");
// // });

// router.post("/transporter/:transporter_id/createVehicle");

// router.get("/displayVehicles");

// Dashboard
router.get("/dashboard", isAuthenticated, dashboard);
router.get("/dashboard-copy", (req, res) => {
  res.render("Dashboard/dashboard-copy");
});

router.get("/report", registerUserReport);

router.get("/chartReport", orderReport);

router.get("/notifications", listNotifications);

router.get("/notificationCount", notificationCount);

router.get("/readNotification", notificationRead);

// Change Password API
router.get("/changePassword", isAuthenticated, (req, res) => {
  res.render("Pages/change-password");
});

router.post("/changePassword", changePassword);

// Profile API
router.get("/profile", isAuthenticated, profile);

router.get("/update-profile", isAuthenticated, updateProfile);

router.post("/update-profile", isAuthenticated, updatedProfile);

// Calendar
router.get("/calendar", (req, res) => {
  res.render("Calendar/calendar");
});

// Email
router.get("/email-compose", (req, res) => {
  res.render("Email/email-compose");
});
router.get("/email-inbox", (req, res) => {
  res.render("Email/email-inbox");
});
router.get("/email-read", (req, res) => {
  res.render("Email/email-read");
});
router.get("/email-templates-alert", (req, res) => {
  res.render("Email/email-templates-alert");
});
router.get("/email-templates-basic", (req, res) => {
  res.render("Email/email-templates-basic");
});
router.get("/email-templates-billing", (req, res) => {
  res.render("Email/email-templates-billing");
});

// UI Elements
router.get("/ui-alertify", (req, res) => {
  res.render("UiElements/ui-alertify");
});
router.get("/ui-alerts", (req, res) => {
  res.render("UiElements/ui-alerts");
});
router.get("/ui-animation", (req, res) => {
  res.render("UiElements/ui-animation");
});
router.get("/ui-badge", (req, res) => {
  res.render("UiElements/ui-badge");
});
router.get("/ui-buttons", (req, res) => {
  res.render("UiElements/ui-buttons");
});
router.get("/ui-cards", (req, res) => {
  res.render("UiElements/ui-cards");
});
router.get("/ui-carousel", (req, res) => {
  res.render("UiElements/ui-carousel");
});
router.get("/ui-colors", (req, res) => {
  res.render("UiElements/ui-colors");
});
router.get("/ui-dropdowns", (req, res) => {
  res.render("UiElements/ui-dropdowns");
});
router.get("/ui-grid", (req, res) => {
  res.render("UiElements/ui-grid");
});
router.get("/ui-highlight", (req, res) => {
  res.render("UiElements/ui-highlight");
});
router.get("/ui-images", (req, res) => {
  res.render("UiElements/ui-images");
});
router.get("/ui-lightbox", (req, res) => {
  res.render("UiElements/ui-lightbox");
});
router.get("/ui-modals", (req, res) => {
  res.render("UiElements/ui-modals");
});
router.get("/ui-navs", (req, res) => {
  res.render("UiElements/ui-navs");
});
router.get("/ui-nestable", (req, res) => {
  res.render("UiElements/ui-nestable");
});
router.get("/ui-pagination", (req, res) => {
  res.render("UiElements/ui-pagination");
});
router.get("/ui-popover-tooltips", (req, res) => {
  res.render("UiElements/ui-popover-tooltips");
});
router.get("/ui-progressbars", (req, res) => {
  res.render("UiElements/ui-progressbars");
});
router.get("/ui-rangeslider", (req, res) => {
  res.render("UiElements/ui-rangeslider");
});
router.get("/ui-rating", (req, res) => {
  res.render("UiElements/ui-rating");
});
router.get("/ui-sessiontimeout", (req, res) => {
  res.render("UiElements/ui-sessiontimeout");
});
router.get("/ui-sweet-alert", (req, res) => {
  res.render("UiElements/ui-sweet-alert");
});
router.get("/ui-sessiontimeout", (req, res) => {
  res.render("UiElements/ui-sessiontimeout");
});
router.get("/ui-tabs-accordions", (req, res) => {
  res.render("UiElements/ui-tabs-accordions");
});
router.get("/ui-typography", (req, res) => {
  res.render("UiElements/ui-typography");
});
router.get("/ui-video", (req, res) => {
  res.render("UiElements/ui-video");
});

// Form Elements

router.get("/form-elements", (req, res) => {
  res.render("Forms/form-elements");
});
router.get("/form-advanced", (req, res) => {
  res.render("Forms/form-advanced");
});
router.get("/form-editors", (req, res) => {
  res.render("Forms/form-editors");
});
router.get("/form-validation", (req, res) => {
  res.render("Forms/form-validation");
});
router.get("/form-mask", (req, res) => {
  res.render("Forms/form-mask");
});
router.get("/form-summernote", (req, res) => {
  res.render("Forms/form-summernote");
});
router.get("/form-uploads", (req, res) => {
  res.render("Forms/form-uploads");
});
router.get("/form-validation", (req, res) => {
  res.render("Forms/form-validation");
});
router.get("/form-wizard", (req, res) => {
  res.render("Forms/form-wizard");
});
router.get("/form-xeditable", (req, res) => {
  res.render("Forms/form-xeditable");
});

// Charts
router.get("/charts-c3", (req, res) => {
  res.render("Charts/charts-c3");
});
router.get("/charts-chartist", (req, res) => {
  res.render("Charts/charts-chartist");
});
router.get("/charts-chartjs", (req, res) => {
  res.render("Charts/charts-chartjs");
});
router.get("/charts-flot", (req, res) => {
  res.render("Charts/charts-flot");
});
router.get("/charts-morris", (req, res) => {
  res.render("Charts/charts-morris");
});
router.get("/charts-other", (req, res) => {
  res.render("Charts/charts-other");
});
router.get("/charts-peity", (req, res) => {
  res.render("Charts/charts-peity");
});
router.get("/charts-sparkline", (req, res) => {
  res.render("Charts/charts-sparkline");
});

//ecommerce
router.get("/ecommerce-customers", (req, res) => {
  res.render("Ecommerce/ecommerce-customers");
});
router.get("/ecommerce-order-history", (req, res) => {
  res.render("Ecommerce/ecommerce-order-history");
});
router.get("/ecommerce-product-edit", (req, res) => {
  res.render("Ecommerce/ecommerce-product-edit");
});
router.get("/ecommerce-product-grid", (req, res) => {
  res.render("Ecommerce/ecommerce-product-grid");
});
router.get("/ecommerce-product-list", (req, res) => {
  res.render("Ecommerce/ecommerce-product-list");
});

//tables
router.get("/tables-basic", (req, res) => {
  res.render("Tables/tables-basic");
});
router.get("/tables-datatable", (req, res) => {
  res.render("Tables/tables-datatable");
});
router.get("/tables-editable", (req, res) => {
  res.render("Tables/tables-editable");
});
router.get("/tables-responsive", (req, res) => {
  res.render("Tables/tables-responsive");
});

//Icons
router.get("/icons-dripicons", (req, res) => {
  res.render("Icons/icons-dripicons");
});
router.get("/icons-fontawesome", (req, res) => {
  res.render("Icons/icons-fontawesome");
});
router.get("/icons-ion", (req, res) => {
  res.render("Icons/icons-ion");
});
router.get("/icons-material", (req, res) => {
  res.render("Icons/icons-material");
});
router.get("/icons-mobirise", (req, res) => {
  res.render("Icons/icons-mobirise");
});
router.get("/icons-themify", (req, res) => {
  res.render("Icons/icons-themify");
});
router.get("/icons-typicons", (req, res) => {
  res.render("Icons/icons-typicons");
});
router.get("/icons-weather", (req, res) => {
  res.render("Icons/icons-weather");
});

//Google Maps
router.get("/maps-google", (req, res) => {
  res.render("Maps/maps-google");
});
router.get("/maps-vector", (req, res) => {
  res.render("Maps/maps-vector");
});
//Widgets
router.get("/widgets", (req, res) => {
  res.render("Widgets/widgets");
});
//pages
router.get("/pages-404", (req, res) => {
  res.render("Pages/pages-404");
});
router.get("/pages-500", (req, res) => {
  res.render("Pages/pages-500");
});
router.get("/pages-blank", (req, res) => {
  res.render("Pages/pages-blank");
});
router.get("/pages-coming-soon", (req, res) => {
  res.render("Pages/pages-coming-soon");
});
router.get("/pages-contact", (req, res) => {
  res.render("Pages/pages-contact");
});
router.get("/pages-directory", (req, res) => {
  res.render("Pages/pages-directory");
});
router.get("/pages-faq", (req, res) => {
  res.render("Pages/pages-faq");
});
router.get("/pages-gallery", (req, res) => {
  res.render("Pages/pages-gallery");
});
router.get("/pages-invoice", (req, res) => {
  res.render("Pages/pages-invoice");
});
router.get("/pages-lock-screen", (req, res) => {
  res.render("Pages/pages-lock-screen");
});
router.get("/pages-maintenance", (req, res) => {
  res.render("Pages/pages-maintenance");
});
router.get("/pages-pricing", (req, res) => {
  res.render("Pages/pages-pricing");
});
router.get("/pages-recoverpw", (req, res) => {
  res.render("Pages/pages-recoverpw");
});
router.get("/pages-register", (req, res) => {
  res.render("Pages/pages-register");
});
router.get("/pages-timeline", (req, res) => {
  res.render("Pages/pages-timeline");
});

//partials
router.get("/Breadcrumb", (req, res) => {
  res.render("Partials/Breadcrumb");
});
router.get("/Footer", (req, res) => {
  res.render("Partials/Footer");
});
router.get("/FooterRoot", (req, res) => {
  res.render("Partials/FooterRoot");
});
router.get("/FooterScript", (req, res) => {
  res.render("Partials/FooterScript");
});
router.get("/Header", (req, res) => {
  res.render("Partials/Header");
});
router.get("/HeaderRoot", (req, res) => {
  res.render("Partials/HeaderRoot");
});
router.get("/HeaderStyle", (req, res) => {
  res.render("Partials/HeaderStyle");
});
router.get("/Sidebar", (req, res) => {
  let notifications = [];
  const getNotifications = db.collection("notification").get();
  getNotifications.forEach((doc) => {
    const notification = { id: doc.id, notificationData: doc.data() };
    notifications.push(notification);
  });
  res.render("Partials/Sidebar", { notifications: notifications });
});
router.get("/TinyCharts", (req, res) => {
  res.render("Partials/TinyCharts");
});

module.exports = router;
