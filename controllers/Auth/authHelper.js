// for checking empty string or not
const isEmpty = (string) => {
  if (string.trim() == "") {
    return true;
  } else {
    return false;
  }
};

// validating signin data
exports.validateSignInData = (data) => {
  let errors = [];
  if (isEmpty(data.email)) {
    errors.push({ msg: "Email is required." });
  }
  if (isEmpty(data.password)) {
    errors.push({ msg: "Password is required" });
  }

  return {
    errors,
    valid: errors.length === 0 ? true : false,
  };
};

// validating Forget Password data
exports.validateForgetPasswordData = (data) => {
  let errors = [];
  if (isEmpty(data.email)) {
    errors.push({ msg: "Please enter your Email" });
  }
  return {
    errors,
    valid: errors.length === 0 ? true : false,
  };
};

// validating Change Password data
exports.validateChangePasswordData = (data) => {
  let errors = [];
  if (isEmpty(data.password)) {
    errors.push({ msg: "Please enter your password" });
  }
  if (isEmpty(data.newPassword)) {
    errors.push({ msg: "Please retype your password" });
  }
  if (data.password.length < 6) {
    errors.push({ msg: "Password should be at least 6 character long...!! " });
  }
  if (data.password !== data.newPassword) {
    errors.push({ msg: "Password does not match...!! " });
  }
  return {
    errors,
    valid: errors.length === 0 ? true : false,
  };
};
