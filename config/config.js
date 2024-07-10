const firebase = require("firebase");
require("dotenv").config();

const {
  API_KEY,
  AUTH_DOMAIN,
  DATABASE_URL,
  PROJECT_ID,
  STORAGE_BUCKET,
  MESSAGING_SENDER_ID,
  APP_ID,
  MEASUREMENT_ID,
} = process.env;

const firebaseConfig = {
  apiKey: API_KEY,
  databaseURL: DATABASE_URL,
  authDomain: AUTH_DOMAIN,
  projectId: PROJECT_ID,
  storageBucket: STORAGE_BUCKET,
  messagingSenderId: MESSAGING_SENDER_ID,
  appId: APP_ID,
  measurementId: MEASUREMENT_ID
}

// const firebaseConfig = {
//   apiKey: "AIzaSyDWcZSbyp_kYJSNxLRVVemkx_5V9JlQDHA",
//   authDomain: "logistics-ondemand-app.firebaseapp.com",
//   databaseURL: "https://logistics-ondemand-app.firebaseio.com",
//   projectId: "logistics-ondemand-app",
//   storageBucket: "logistics-ondemand-app.appspot.com",
//   messagingSenderId: "335686843365",
//   appId: "1:335686843365:web:d4bb2a7c82af72fcdf8d0c",
//   measurementId: "G-7WPCXTQJ8N",
// };

// const firebaseConfig = {
//   apiKey: "AIzaSyBZWSFN0-Eee-Y1ySOYtbZqPKGoFoEk94g",
//   databaseURL: "https://logistics-test-project-a8420.firebaseio.com",
//   authDomain: "logistics-test-project-a8420.firebaseapp.com",
//   projectId: "logistics-test-project-a8420",
//   storageBucket: "logistics-test-project-a8420.appspot.com",
//   messagingSenderId: "45149679574",
//   appId: "1:45149679574:web:52883630a6e7b9c706be77",
//   measurementId: "G-RP2JZZ2251"
// }
// Initialize Firebase
// firebase.initializeApp(firebaseConfig);
// const db = firebase.firestore();
// firebase.analytics();

module.exports = firebaseConfig;
