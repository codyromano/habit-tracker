function Habit() {}
var proto = Habit.prototype; 

/* TODO: Move this to U.js utilities file and include
the utils file as a depedency */
function toString(any) { 
  return '' + any; 
}

/* You can use the 'content' parameter to output additional 
request-specific data such as an array of habits (in the case
of Habit.getAll()).'content' may be left undefined. 
*/
function printResponse(res, success, message, content) {
  var result = {
    success: success, 
    message: message, 
    content: content
  };
  res.send(JSON.stringify(result));
}

proto.getAll = function(config, user, db, req, res) {
  /* This may seem strange if you're not familiar with the concepts of 
  currying and partial application in JavaScript. Here's a good reference:
  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
  */
  var onSuccess = printResponse.bind(undefined, res, true, 'Query OK'),
    onFailure = printResponse.bind(undefined, res, false, 'Query failed');

  user.getProfile().then(function(result) {
    var userID = toString(result.userID); 

    var params = {
      AttributesToGet: ['content'],
      TableName: config.AWS_HABITS_TABLE,
      Key: {
        userId: {"S" : userID},
        title: {"S" : "all-user-habits"}
      }
    };
    db.getItem(params, onResponse); 
  });

  function onResponse(err, data) {
    (err) ? onFailure() : onSuccess(data.Item.content.S);
  }
};

proto.saveAll = function(config, user, db, req, res) {
  var onSuccess = printResponse.bind(undefined, res, true, 'Saved record'),
      onFailure = printResponse.bind(undefined, res, false, 'Save failed');

  user.getProfile().then(function(profile) {
    var userID = profile.userID; 

    var newItem = {
      TableName: config.AWS_HABITS_TABLE,
      Item: {
        userId: {'S' : toString(req.body.userID)}, 
        title: {'S' : 'all-user-habits'},
        content: {'S' : req.body.content}
      }
    };
    db.putItem(newItem, onSuccess, onFailure);
  });
};

module.exports = Habit;
