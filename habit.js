function Habit() {}
var proto = Habit.prototype; 

// The valid time range in which a habit can be completed (in milliseconds)
proto.FREQUENCY_MIN = 1000 * 60; // 1 minute
proto.FREQUENCY_MAX = 1000 * 60 * 60 * 24 * 365 * 10; // 10 years 
proto.TITLE_MAX_LENGTH = 100;

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
  https://developer.mozilla.org/en-US/docs/Web/JavaScript/
  Reference/Global_Objects/Function/bind
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

function toString(val) {
  return '' + val;
}

function generateHabitID(userID) {
  var userIDSegment = userID,
      timeSegment = new Date().getTime();

  /* The random number is truncated to allow for a shorter ID.
  A short random number combined with userID and timestamp should 
  provide enough entropy in this case. */
  var randSegment = toString(Math.random()).slice(-2);
  return [userIDSegment, timeSegment, randSegment].join('-');
}

/**
* @desc DynamoDB associates a code with each data type. This tries to
* infer the code expected by Dynamo based on the type of your data structure.
*
* More info: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/
* AWS/DynamoDB.html#putItem-property
*/
function getDynamoCode(data) {
  var dataType = typeof data,
      firstElementType;

  if (dataType === 'string') {
    return 'S';
  }
  if (dataType === 'number') {
    return 'N';
  }
  if (dataType === 'object' && data instanceof Array) {
    /* This infers the type of values in your array by checking 
    the first element, but it doesn't check the whole array. You 
    may encounter issues with Dynamo if your array contains mixed types. */
    firstElementType = typeof data[0];

    if (firstElementType === 'number') {
      return 'NS'; // Number set
    }
    if (firstElementType === 'string') {
      return 'SS';
    }
  }

  /* This function does not cover all the data types in the AWS documentation.
  You may need to implement a new type check if the 
  ones above aren't sufficient. */
  throw new Error('Cannot infer data type code for: ' + data);
}

console.assert(getDynamoCode('foo') === 'S'); 
console.assert(getDynamoCode(42) === 'N'); 
console.assert(getDynamoCode([42,42]) === 'NS');


function getDynamoItem(params) {
  var paramValue, dataTypeCode, typeValuePair; 

  for (var paramName in params) {
    paramValue = params[paramName];
    dataTypeCode = getDynamoCode(paramValue);

    // Dynamo expects elements in a number array to be cast as strings
    if (dataTypeCode === 'NS') {
      paramValue = paramValue.map(toString);
    }
    if (dataTypeCode === 'N') {
      paramValue = toString(paramValue);
    }

    typeValuePair = {};
    typeValuePair[dataTypeCode] = paramValue;

    params[paramName] = typeValuePair;
  }
  return params;
}

/**
* @desc Save a single habit record to Dynamo
*/
proto.save = function(config, user, db, req, res) {
  var currentTime = new Date().getTime();

  /* How often (in milliseconds) the user must complete a habit */
  var freq = req.body.freq,
      content = req.body.content;

  /**** Basic request validation ****/
  if (isNaN(parseInt(freq))) {
    printResponse(res, false, 'Frequency must be an integer.');
    return; 
  }
  if (freq < this.FREQUENCY_MIN || freq > this.FREQUENCY_MAX) {
    printResponse(res, false, 'Frequency ' + freq + ' is not within ' +
      'permissible range (' + this.FREQUENCY_MIN + '-' + 
        this.FREQUENCY_MAX + ')');
    return;
  }
  if (typeof content !== 'string' || !content.length || 
    content.length > this.TITLE_MAX_LENGTH ) {
    printResponse(res, false, 'Invalid habit title');
    return;
  }

  user.getProfile().then(function(profile) {
    // Callbacks for Dynamo success or failure
    var onSuccess = printResponse.bind(undefined, res, true, 'Saved record'),
    onFailure = printResponse.bind(undefined, res, false, 'Save failed');

    var itemContent = getDynamoItem({
      habitID: generateHabitID(profile.userID),
      ownerID: parseInt(profile.userID),
      content: req.body.content,
      timeLastUpdated: currentTime,
      timeCreated: currentTime,
      freq: freq,
      taps: [currentTime]
    });

    var newItem = {
      TableName: config.AWS_HABITS_TABLE_V2,
      Item: itemContent
    };
    db.putItem(newItem, onSuccess, onFailure);
  });
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
