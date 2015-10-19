(function(exports, PubSub) {

  var UserStore = exports.UserStore = {}; 

  var user = {
    id: null,
    name: null
  };

  function levelSum(habits) {
    return habits.reduce(function(result, habit) {
      return result + habit.attr('level');
    }, 0);
  }

  function getLifeScore(levelSum, totalHabits) {
    return Math.max(levelSum - totalHabits, 1);
  }

  // Return a specific attribute or the whole object
  UserStore.getProfile = function(key) {
    return user[key] || user; 
  };

  function updateProfile(props) {
    for (var key in props) {
      user[key] = props[key];
    }

    PubSub.publish('userProfileChanged', user); 

    console.assert(
      user.id && user.name,
      'user attributes were added'
    );
  } 

  PubSub.subscribe('userAuthenticated', updateProfile); 
  PubSub.subscribe('habitListChanged', function(habits) {
    var undeletedHabits = habits.filter(function(habit) {
      return habit.deleted !== true;
    });
    var sum = levelSum(undeletedHabits);
    var score = getLifeScore(sum, undeletedHabits.length); 
    PubSub.publish('lifeScoreCalculated', score); 
  });

})(window, PubSub); 
