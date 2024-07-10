// for checking empty string or not
const isEmpty = (string) => {
  if (string === "" || string === undefined) {
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

// Validating Trasporter data
exports.validateTransporterData = (data) => {
  let errors = [];
  if (isEmpty(data.firstname)) {
    errors.push({ msg: "First name is required" });
  }
  if (isEmpty(data.lastname)) {
    errors.push({ msg: "Last name is required" });
  }
  if (isEmpty(data.phone)) {
    errors.push({ msg: "Phone is required" });
  }
  // if (isEmpty(data.password)) {
  //   errors.push({ msg: "Phone is required" });
  // }
  // if (isEmpty(data.email)) {
  //   errors.push({ msg: "Email is required" });
  // }

  // Address Validation
  // if (isEmpty(data.address)) {
  //   errors.push({ msg: "address is required" });
  // }
  // if (isEmpty(data.area)) {
  //   errors.push({ msg: "area is required" });
  // }
  // if (isEmpty(data.city)) {
  //   errors.push({ msg: "city is required" });
  // }
  // if (isEmpty(data.pincode)) {
  //   errors.push({ msg: "pincode is required" });
  // }
  // if (isEmpty(data.state)) {
  //   errors.push({ msg: "state is required" });
  // }
  // if (isEmpty(data.country)) {
  //   errors.push({ msg: "country is required" });
  // }
  // if (data.pincode.length !== 6) {
  //   errors.push({ msg: "Pincode should be exact 6 digits long" });
  // }
  if (data.phone.length !== 10) {
    errors.push({ msg: "Phone number should be exact 10 digits long" });
  }
  // if (!isNumeric(data.pincode)) {
  //   errors.push({ msg: "Pincode should be numbers only." });
  // }
  // if (!isNumeric(data.phone)) {
  //   errors.push({ msg: "Phone number should be numbers only." });
  // }
  // if (data.gstNo) {
  //   if (data.gstNo.length !== 15) {
  //     errors.push({ msg: "GST number should be 15 characters long" });
  //   }
  // }
  // if (isEmpty(data.registered)) {
  //   errors.push({ msg: "Please select an option of registered" });
  // }
  // if (isEmpty(data.status)) {
  //   errors.push({ msg: "Please select an option of status" });
  // }

  // Driver's Validation
  // if (isEmpty(data.FirstName)) {
  //   errors.push({ msg: "Drivers's First Name is required" });
  // }
  // if (isEmpty(data.LastName)) {
  //   errors.push({ msg: "Drivers's Last Name is required" });
  // }
  // if (isEmpty(data.Email)) {
  //   errors.push({ msg: "Drivers's Email is required" });
  // }
  // if (isEmpty(data.Phone)) {
  //   errors.push({ msg: "Drivers's Phone is required" });
  // }
  // if (isEmpty(data.Age)) {
  //   errors.push({ msg: "Drivers's Age is required" });
  // }
  // if (data.Phone.length !== 10) {
  //   errors.push({
  //     msg: "Driver's Phone number should be exact 10 digits long",
  //   });
  // }
  // if (!isNumeric(data.Phone)) {
  //   errors.push({ msg: "Driver's Phone number should be numbers only." });
  // }
  // if (!isNumeric(data.Age)) {
  //   errors.push({ msg: "Driver's age should be numbers only." });
  // }

  // Vehicle's Validation
  // if (isEmpty(data.vehicleTypeName)) {
  //   errors.push({ msg: "Please select an option of Vehicle-Type" });
  // }
  // if (isEmpty(data.VehicleNumber)) {
  //   errors.push({ msg: "Please enter Vehicle Number" });
  // }
  // if (isEmpty(data.ChassisNumber)) {
  //   errors.push({ msg: "Please enter Vehicle's Chassis Number" });
  // }
  // if (data.ChassisNumber.length !== 17) {
  //   errors.push({
  //     msg: "Vehicle's chassis number should be exact 17 digits long",
  //   });
  // }
  // if (data.VehicleNumber !== data.VehicleNumber.toUpperCase()) {
  //   errors.push({
  //     msg: "Vehicle number should be in uppercase.",
  //   });
  // }
  // if (data.ChassisNumber !== data.ChassisNumber.toUpperCase()) {
  //   errors.push({
  //     msg: "Vehicle's chassis number should be in uppercase.",
  //   });
  // }

  return {
    errors,
    valid: errors.length == 0 ? true : false,
  };
};

//Validating Trasporter data
exports.validateTransporterDocuments = (files) => {
  let fileErrors = [];

  if (!files.profile) {
    fileErrors.push({
      msg: "Please upload your profile image",
    });
  }
  if (!files.AddressProof) {
    fileErrors.push({
      msg: "Please upload PAN Card/Aadhar Card/Voter ID as a proof of address",
    });
  }
  if (!files.IdentityProof) {
    fileErrors.push({
      msg: "Please upload Driving License as a proof of Identity",
    });
  }
  if (!files.icons) {
    fileErrors.push({
      msg: "Please upload vehicle images",
    });
  }

  return {
    fileErrors,
    fileValid: fileErrors.length == 0 ? true : false,
  };
};
