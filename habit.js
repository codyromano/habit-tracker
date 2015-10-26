function Habit() {}
var proto = Habit.prototype; 

// May be overly simple, but it improves readability
function toString(any) { 
  return '' + any; 
}

proto.getAll = function(config, user, db, req, res) {
  var userId = toString(req.params.id); 

  var params = {
    AttributesToGet: ['content'],
    TableName: config.AWS_HABITS_TABLE,
    Key: {
      userId: {"S" : userId},
      title: {"S" : "all-user-habits"}
    }
  };

  function onResponse(err, data) {
    var result; 

    if (err) {
      result = {success: false, message: 'Could not query all user habits'};
    } else if (data) {
      result = {success: true, message: 'Query successful', content: data.Item.content.S};
    }

    res.send(JSON.stringify(result));
  }

  db.getItem(params, onResponse); 
};

proto.saveAll = function(config, db, req, res) {
  var newItem = {
    TableName: config.AWS_HABITS_TABLE,
    Item: {
      userId: {'S' : toString(req.body.userId)}, 
      title: {'S' : 'all-user-habits'},
      content: {'S' : req.body.content}
    }
  };

  function onSuccess(msg) {
    var result = {success: true, message: 'Saved record'};
    res.send(JSON.stringify(result));
  }

  function onFailure(err) {
    var result = {success: false, message: 'Could not save record'};
    res.send(JSON.stringify(result));
  }

  db.putItem(newItem, onSuccess, onFailure);
};

module.exports = Habit;
