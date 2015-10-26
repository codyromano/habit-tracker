function mapObj(obj, fn) {
  for (var key in obj) {
    obj[key] = fn(key, obj[key]);
  }
  return obj;
}

function User(appConfig, db, id, profile) {
  'use strict';

  if (['number','string'].indexOf(typeof id) === -1) {
    throw new Error('Cannot instantiate user because ID is invalid');
  }

  var attrs = {
    userID: id,
    name: null,
    email: null,
    profilePhoto: null
  };

  this.getProfile = function() {
    return attrs;
  };

  this.save = function() {
    var record = mapObj(attrs, function(key, val) {
      return '' + val; // Stringify for Dynamo
    });

    var newItem = {
      TableName: appConfig.AWS_USERS_TABLE,
      Item: {}
    };

    for (var attrName in record) {
      newItem.Item[attrName] = {'S' : record[attrName]};
    }

    console.log('record: ', JSON.stringify(record));

    return new Promise(function(resolve, reject) {
      db.putItem(newItem, resolve, reject);
    });
  };

  this.setProfile = function(props) {
    attrs.userID = props.id || attrs.userID; 
    attrs.name = props.displayName || attrs.name;

    if (props.emails) {
      attrs.email = props.emails[0].value; 
    }
    if (props.photos) {
      attrs.profilePhoto = props.photos[0].value;
    }
  };

  // Validate and set default properties
  if (typeof profile === 'object') {
    this.setProfile(profile);
  }
}

module.exports = User;