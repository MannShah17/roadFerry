// for checking empty string or not
const isEmpty = (string) => {
  if (string === '' || string === undefined) {
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

// Validating Subscription data
exports.validateSubscriptionData = (data) => {
  let errors = [];

  const amount = parseFloat(data.amount);
  const discountedPrice = parseFloat(data.discountedPrice);

  if (isNaN(discountedPrice) || discountedPrice > amount) {
    errors.push({
      msg: 'Discounted price must be a valid number and less than or equal to the actual price',
    });
  }
  if (isEmpty(data.vehicleTypeName)) {
    errors.push({ msg: 'Please select an option of Vehicle-Type' });
  }
  if (isEmpty(data.planName)) {
    errors.push({ msg: 'Please enter the plan name' });
  }
  if (isEmpty(data.description)) {
    errors.push({ msg: 'Please enter description for Subscription plan' });
  }
  if (isEmpty(data.amount)) {
    errors.push({ msg: 'Please enter the amount for Subscription plan' });
  }
  // if (isEmpty(data.trialPeriod)) {
  //   errors.push({ msg: 'Please enter the trial period for Subscription plan' });
  // }
  if (!isNumeric(data.amount)) {
    errors.push({ msg: 'Subscription amount should be in numbers only.' });
  }
  if (!isNumeric(data.trialPeriod)) {
    errors.push({
      msg: 'Subscription trial period should be in numbers only.',
    });
  }

  return {
    errors,
    valid: errors.length == 0 ? true : false,
  };
};
