var config = require('./config'),
    db = require('./db'),
    User = require('./models/User');

var activeUsers = {};

/**
* @desc Create and return a user instance 
*/
function add(userID, passportProfile) { 
  var userInstance; 

  if (typeof userID !== 'string' || !userID.length) {
    throw new Error('userID must be a non-empty string; received %s', userID);
  }

  // Create the instance if it doesn't exist
  if (activeUsers[userID]) {
    userInstance = activeUsers[userID];
  } else {
    userInstance = activeUsers[userID] = new User(config, db, 
      userID, passportProfile);
  }

  console.log('active users: %s', Object.keys(activeUsers).length);
  return userInstance;
}

function get(userID) {
  return activeUsers[userID];
}

module.exports = {
  add: add,
  get: get
};
