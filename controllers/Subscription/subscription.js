const { db, firebase } = require('../../config/admin');
const { validateSubscriptionData } = require('./subscriptionHelper');

// Create subsctiption controller --> GET
exports.addSubscription = async (req, res) => {
  const vehicleTypes = [];
  const data = await db.collection('vehicles').get();
  data.forEach((doc) => {
    // const vehicleType = { id: doc.id, vehicleTypeData: doc.data() };
    vehicleTypes.push(doc.data().vehicle_type);
  });
  try {
    return res.render('Subscription/addSubscription', {
      vehicleTypes: vehicleTypes,
      amount: 0,
      discountedPrice: 0,
      dayPlans: 0,
      weekPlans: [],
      monthPlans: [],
    });
  } catch (error) {
    const errors = [];
    errors.push({ msg: error.message });
    return res.render('Subscription/addSubscription', {
      errors: errors,
      vehicleTypes: vehicleTypes,
      amount: 0,
      discountedPrice: 0,
      dayPlans: 0,
      weekPlans: [],
      monthPlans: [],
    });
  }
};

// Create subsctiption controller --> POST
exports.addedSubscription = async (req, res) => {
  const vehicleTypes = [];
  const vehicleTypeData = await db.collection('vehicles').get();
  vehicleTypeData.forEach((doc) => {
    vehicleTypes.push(doc.data().vehicle_type);
  });

  try {
    console.log('YOU ADDED NEW PLAN');
    const data = req.body;
    console.log(data)

    const { valid, errors } = validateSubscriptionData(data);

    if (!valid) {
      return res.render('Subscription/addSubscription', {
        vehicleTypes: vehicleTypes,
        errors,
        dayPlans: data.dayPlans || [],
        weekPlans: data.weekPlans || [],
        monthPlans: data.monthPlans || []
      });
    }

    const amount = parseFloat(data.amount);
    const discountedPrice = parseFloat(data.discountedPrice);
    const discountPercentage = ((amount - discountedPrice) / amount) * 100;
    const dayPlans = parseInt(data.dayPlans);
    const weekPlans = parseInt(data.weekPlans);
    const monthPlans = parseInt(data.monthPlans);

    console.log(dayPlans);
    console.log(weekPlans);
    console.log(monthPlans);

    const subscriptionData = {
      vehicle_type: data.vehicleTypeName,
      plan_name: data.planName,
      description: data.description,
      amount: amount,
      discounted_price: discountedPrice,
      discount_percentage: discountPercentage,
      trial_period: data.trialPeriod,
      day_plans: dayPlans || 0,
      week_plans: weekPlans || 0,
      month_plans: monthPlans || 0,
      status: data.planStatus,
      created_at: new Date(),
      is_deleted: false,
    };
    console.log(subscriptionData);

    const newPlan = await db.collection('subscription_plan').doc();
    await newPlan.set(subscriptionData);

    return res.render('Subscription/addSubscription', {
      vehicleTypes: vehicleTypes,
    });
  } catch (error) {
    const errors = [];
    errors.push({ msg: error.message });
    return res.render('Subscription/addSubscription', {
      vehicleTypes: vehicleTypes,
      errors,
      // dayPlans: data.dayPlans || [],
      // weekPlans: data.weekPlans || [],
      // monthPlans: data.monthPlans || []
    });
  }
};


// Get all subsctiptions controller
exports.listSubscriptions = async (req, res) => {
  try {
    const subscriptions = [];
    const data = await db
      .collection('subscription_plan')
      .orderBy('created_at', 'desc')
      .get();
    data.forEach((doc) => {
      if (doc.data().is_deleted === false) {
        const subscription = { id: doc.id, subscriptionData: doc.data() };
        subscriptions.push(subscription);
      }
    });
    return res.render('Subscription/displaySubscriptions', {
      subscriptions: subscriptions,
    });
  } catch (error) {
    const errors = [];
    errors.push(error.message);
    return res.render('Subscription/displaySubscriptions', {
      errors: errors,
    });
  }
};

// Remove subscription plan controller
exports.removeSubscription = async (req, res) => {
  try {
    const id = req.params.subscription_id;

    let getSubscriptionById = await db.collection('subscription_plan').doc(id);
    let subscription = await getSubscriptionById.get();
    let subscriptionData = await subscription.data();

    if (!subscriptionData) {
      errors.push({ msg: 'There are no data available' });
      return res.render('Subscription/displaySubscriptions', {
        errors: errors,
      });
    }

    const deletedData = {
      type: 'subscription_plan',
      id: await db.doc('subscription_plan/' + id),
      user_id: await firebase.auth().currentUser.uid,
      deleted_at: new Date(),
    };

    await getSubscriptionById.update({ is_deleted: true });

    await db.collection('deletion_logs').add(deletedData);

    return res.redirect('back');
  } catch (error) {
    console.log(error);
  }
};

// Get subscription plan details controller
exports.subscriptionDetails = async (req, res) => {
  try {
    const id = req.params.subscription_id;

    const getSubscriptionById = await db
      .collection('subscription_plan')
      .doc(id);
    const data = await getSubscriptionById.get();
    if (data.data() == undefined) {
      req.flash('error_msg', 'Subscription Plan not found...!!');
      return res.redirect('/subscription/list');
    } else {
      let subscription = { id: data.id, subscriptionData: data.data() };
      return res.render('Subscription/subscriptionDetails', {
        subscription: subscription,
      });
    }
  } catch (error) {
    req.flash('error_msg', error.message);
    return res.redirect('/subscription/list');
  }
};

// Update subscription plan controller --> GET
exports.updateSubscription = async (req, res) => {
  try {
    const errors = [];
    const id = req.params.subscription_id;
    const data = await db.collection('subscription_plan').doc(id).get();
    if (data.data() === undefined) {
      errors.push({ msg: 'Subscription Plan not found...!!' });
      return res.render('Errors/errors', { errors: errors });
    }
    const subscriptionData = data.data();
    return res.render('Subscription/editSubscription', {
      subscription: subscriptionData,
    });
  } catch (error) {
    const errors = [];
    errors.push({ msg: error.message });
    return res.render('Errors/errors', { errors: errors });
  }
};

// Update subscription plan controller --> POST
exports.updatedSubscription = async (req, res) => {
  try {
    const id = req.params.subscription_id;

    const data = req.body;

    const { valid, errors } = validateSubscriptionData(data);

    if (!valid) {
      if (errors.length > 0) {
        for (var i = 0; i <= errors.length; i++) {
          req.flash('error_msg', errors[i].msg);
          return res.redirect(`/subscription/${id}/edit`);
        }
      }
    }

    const amount = parseFloat(data.amount);
    const discountedPrice = parseFloat(data.discountedPrice);
    const discountPercentage = ((amount - discountedPrice) / amount) * 100;
    const dayPlans = parseInt(data.dayPlans);
    const weekPlans = parseInt(data.weekPlans);
    const monthPlans = parseInt(data.monthPlans);

    const subscriptionData = {
      plan_name: data.planName,
      description: data.description,
      amount: amount,
      discounted_price: discountedPrice,
      discount_percentage: discountPercentage,
      trial_period: data.trialPeriod,
      day_plans: dayPlans || 0,
      week_plans: weekPlans || 0,
      month_plans: monthPlans || 0,
      status: data.planStatus,
    };

    const newSubscription = await db.collection('subscription_plan').doc(id);
    await newSubscription.update(subscriptionData);
    return res.redirect('/subscription/list');
  } catch (error) {
    const errors = [];
    errors.push({ msg: error.code });
    return res.render('Subscription/editSubscription', { errors: errors });
  }
};
