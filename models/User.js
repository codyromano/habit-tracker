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

  this.getAttribute = function(attrName) {
    if (!attrName in attrs) {
      console.warn('User attribute %s does not exist', attrName);
    }
    return attrs[attrName];
  };

  this.attributesLoaded = function() {
    // TODO: Make this check more concise using all() and isString()
    return (typeof attrs.name === 'string' && 
      typeof attrs.email === 'string' && 
      typeof attrs.profilePhoto === 'string');
  };

  this.getProfile = function(useCache) {
    var _self = this; 

    return new Promise(function(resolve, reject) {

      if (useCache === true && _self.attributesLoaded()) {
        console.info('Using cached user attributes');
        resolve(attrs);
        return; 
      }

      // If we're not using cached data, fetch from DynamoDB
      var params = {
        AttributesToGet: ['name','email','profilePhoto'],
        TableName: appConfig.AWS_USERS_TABLE,
        Key: {
          userID: {"S" : attrs.userID}
        }
      };

      db.getItem(params, function(err, data) {

        if (err) {
          console.error(err);
          reject(err);
          return;
        }

        // Update the user instance using the server record
        attrs.name = data.Item.name.S;
        attrs.email = data.Item.email.S;
        attrs.profilePhoto = data.Item.profilePhoto.S;

        resolve(attrs);
      });
    });
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
