// for checking empty string or not
const isEmpty = (string) => {
  if (string.trim() === "") {
    return true;
  } else {
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

// Validating Driver data
exports.validateDriverData = (data) => {
  let errors = [];
  if (isEmpty(data.firstname)) {
    errors.push("First name is required");
  }
  if (isEmpty(data.lastname)) {
    errors.push("Last name is required");
  }
  if (isEmpty(data.phone)) {
    errors.push("Phone is required");
  }
  if (isEmpty(data.email)) {
    errors.push("Email is required");
  }

  // Address Validation
  if (isEmpty(data.address)) {
    errors.push("address is required");
  }
  if (isEmpty(data.area)) {
    errors.push("area is required");
  }
  if (isEmpty(data.city)) {
    errors.push("city is required");
  }
  if (isEmpty(data.pincode)) {
    errors.push("pincode is required");
  }
  if (isEmpty(data.state)) {
    errors.push("state is required");
  }
  if (isEmpty(data.country)) {
    errors.push("country is required");
  }

  if (data.pincode.length !== 6) {
    errors.push("Pincode should be exact 6 digits long");
  }
  if (data.phone.length !== 10) {
    errors.push("Phone number should be exact 10 digits long");
  }
  if (!isNumeric(data.pincode)) {
    errors.push("Pincode should be numbers only.");
  }
  if (!isNumeric(data.phone)) {
    errors.push("Phone number should be numbers only.");
  }

  return {
    errors,
    valid: errors.length === 0 ? true : false,
  };
};
