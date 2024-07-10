// exports.signUp = {
//   name: {
//     notEmpty: true,
//     errorMessage: "Name cannot be empty",
//   },
//   phone_number: {
//     notEmpty: true,
//     errorMessage: "Please Enter Valid Phone Number With Min 10 Digits",
//     isLength: {
//       options: { min: 10, max: 15 },
//     },
//   },
// };

// for checking empty string or not
const isEmpty = (string) => {
  if (string.trim() === "") {
    return true;
  }
  {
    return false;
  }
};

// for checking input value is numeric or not
const isNumeric = (string) => {
  var numbers = /^[0-9]+$/;
  if (string.match(numbers)) {
    return true;
  } else {
    return false;
  }
};

// Validating Admin data
exports.validateData = (data) => {
  let errors = [];
  if (isEmpty(data.name)) {
    errors.push({ msg: "First name is required" });
  }
  if (isEmpty(data.phone_number)) {
    errors.push({ msg: "Phone is required" });
  }
  if (!isNumeric(data.phone_number)) {
    errors.push({ msg: "Phone number should be numbers only." });
  }
  if (data.phone_number.length !== 10) {
    errors.push({ msg: "Phone number should be exact 10 digits" });
  }

  return {
    errors,
    valid: errors.length === 0 ? true : false,
  };
};

exports.validateData2 = () => {
  let errors = [];

  return {
    errors,
    valid: errors.length === 0 ? true : false,
  };
};

exports.validateData3 = () => {
  let errors = [];
 
  return {
    errors,
    valid: errors.length === 0 ? true : false,
  };
};
