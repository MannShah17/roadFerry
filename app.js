var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var expressLayouts = require('express-ejs-layouts');
var cors = require('cors');
var session = require('express-session');
var flash = require('connect-flash'); //

var router = require('./routes/router');
var Authrouter = require('./routes/Authrouter');
var AdminRouter = require('./routes/adminRouter');
var RegisterRouter = require('./routes/RegisterRoute');
var VehicleTypeRouter = require('./routes/vehicleTypeRouter');
var customerRouter = require('./routes/customerRouter');
var transporterRouter = require('./routes/transporterRouter');
var driverRouter = require('./routes/driverRouter');
var vehicleRouter = require('./routes/vehicleRouter');
var subscriptionRouter = require('./routes/subscriptionRouter');
var orderRouter = require('./routes/orderRouter');
var contactRouter = require('./routes/contactRouter');
var Auth2router = require('./routes/auth2router');
// var passwordRouter = require("./routes/passwordRouter");

var loginRouter = require('./routes/loginRouter');
var optRouter = require('./routes/otpRouter');
var transporterpaymentRouter = require('./routes/transpoterpaymentRouter');

var app = express();

app.use('/', Authrouter);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Session
app.use(
  session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 86400000 },
  })
);

// Connect Flash
app.use(flash());

// error handler
app.use(async (req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});
app.use('/', RegisterRouter);

app.use(expressLayouts);
app.use(cors());

app.use('/', router);
app.use('/admin', AdminRouter);
app.use('/vehicle-type', VehicleTypeRouter);
app.use('/customer', customerRouter);
app.use('/transporter', transporterRouter);
app.use('/driver', driverRouter);
app.use('/vehicle', vehicleRouter);
app.use('/subscription', subscriptionRouter);
app.use('/order', orderRouter);
app.use('/contact', contactRouter);
app.use('/auth', Auth2router);
// app.use("/password", passwordRouter);

//app.use("/register",loginRouter);
app.use('/otp', optRouter);
app.use('/transporterpayment', transporterpaymentRouter);

// catch 404 and forward to error handler
// app.use(function (req, res, next) {
//   // const hi = `<h1>HELLO</h1>`;
//   const error404 = `
//   <div style="align:center;">
//   <div class="card">
//   <div class="card-body">
//     <div class="ex-page-content text-center">

//       <h1 class="">404!</h1>
//       <h3 class="">Sorry, page not found</h3>
//       <br />

//       <a
//         class="btn btn-primary mb-5 waves-effect waves-light"
//         href="/dashboard"
//         >Back to Dashboard</a
//       >
//     </div>
//   </div>
// </div>
// </div>`;
//   // res.status(404).send("Page not found...!!");
//   // res.status(404).render("Pages/pages-404");
//   res.status(404).send(error404);
//   next(createError(404));
// });

// error handler
// app.use(function (err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get("env") === "development" ? err : {};

//   //   render the error page
//   res.status(err.status || 500);
//   res.render("error");
// });

module.exports = app;
