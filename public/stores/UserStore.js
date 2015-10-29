(function(exports, PubSub, Ajax) {

  var UserStore = exports.UserStore = {}; 

  let getFirstName = fullName => fullName.trim(' ').split(' ')[0];

  var user = {
    id: null,
    name: null,
    lifeScore: 0
  };

  function levelSum(habits) {
    return habits.reduce(function(result, habit) {
      return result + habit.attr('level');
    }, 0);
  }

  function getLifeScore(levelSum, totalHabits) {
    return Math.max(levelSum - totalHabits, 1);
  }

  UserStore.getLifeScoreRequiredForNewHabit = function(totalHabits) {
    // Subtract a fixed integer to make it easier in the beginning
    return Math.max(1, Math.round(Math.pow(totalHabits, 1.3) - 6));
  };

  // Return a specific attribute or the whole object
  UserStore.getProfile = function(key) {
    return user[key] || user; 
  };

  UserStore.isLoggedIn = function() {
    return user.id !== null;
  };

  function updateProfile(props) {
    for (var key in props) {
      user[key] = props[key];
    }
    if (typeof user.name === 'string') {
      user.firstName = getFirstName(user.name);
    }
    PubSub.publish('userProfileChanged', user); 
  } 

  PubSub.subscribe('userAuthenticated', updateProfile); 
  PubSub.subscribe('habitListChanged', function(habits) {
    var undeletedHabits = habits.filter(function(habit) {
      return habit.deleted !== true;
    });
    var sum = levelSum(undeletedHabits);
    var score = getLifeScore(sum, undeletedHabits.length); 
    updateProfile({lifeScore: score});
  });

  var userRecord = Ajax.send('/api/user/', 'GET');
  userRecord.then(function(response) {
    if (response.userID) {
      PubSub.publish('userAuthenticated', {
        id: response.userID,
        name: response.name,
        profilePicture: response.profilePhoto
      });
    }
  });

})(window, PubSub, Ajax); 
