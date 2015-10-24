(function(exports, PubSub) {

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

})(window, PubSub); 
