(function(exports, PubSub, UserStore, $, config) {
  'use strict';

  var remoteSyncTimeout;
  var profile = UserStore.getProfile(); 

  PubSub.subscribe('userProfileChanged', function(newProfile) {
    profile = newProfile;
  });

  function sync() {
    /*
    return new Promise(function(resolve, reject) {
      $.get("/api/habit/", function(response) {
        try {
          response = JSON.parse(response);
          let parsed = JSON.parse(response.content);
          resolve(parsed);
        } catch (e) {
          reject('Error parsing JSON');
        }
      }).error(function(message) {
        reject(message);
      });

    }).then(function(habitsFromServer) {
      PubSub.publish('habitListChanged', habitsFromServer);
    });
    */
  }

  $.get("/api/habit/", function(response) {
    response = JSON.parse(response);
    let parsed = JSON.parse(response.content);
    habits = parsed; 
    PubSub.publish('habitListChanged', parsed);
  });

  var HabitStore = exports.HabitStore = {}; 
  var habits = [];

  function getHabits() {
    var result = habits;
    return result;
  }

  /**
  * @returns {array} habits that were updated
  */
  function updateHabits(queryObj, fn) {
    var updated = []; 
    habits = habits.map(function(h) {
      var result;
      if (U.isSuperset(h, queryObj)) {
        result = fn(h); 
        result.timeLastUpdated = new Date().getTime();
        updated.push(result); 
      }
      result = result || h; 
      return result;
    });
    //
    PubSub.publish('habitListChanged', habits); 
    return updated; 
  }

  function incrementHabitTaps(uniqAttr, habitID) {
    $.ajax({
      type: 'PUT',
      url: '/api/habit/' + habitID + '/tap'
    });
  }

  function deleteHabit(habitID) {
    $.ajax({
      url: '/api/habit/' + habitID,
      type: 'DELETE'
    }).done(function(result) {
      sync();
    });
  }

  var socket = io();
  socket.on('habit added', function(habit) {
    console.log('received habit added event: %O', habit);
    habits.push(habit);

    PubSub.publish('habitListChanged', habits);
  });

  socket.on('habit deleted', function(habitID) {
    habits = habits.filter(function(habit) {
      return habit.habitID !== habitID; 
    });
    PubSub.publish('habitListChanged', habits);
  });

  function addHabit(habit) {
    var time = U.convertMs(habit.freq, habit.freqType);

    $.post("/api/habit/", {
      content: habit.content, 
      freq: habit.freq
    }).done(function(result) {
      result = JSON.parse(result);

      if (result.success === true) {
        habit.habitID = result.content.habitID; 
        //habits.push(habit);

        PubSub.publish('messageAdded', 'You have ' + time + ' ' + habit.freqType +
        ' to ' + habit.content + '! Tap the progress bar when you\'re done.', 8000);
      } else {
        PubSub.publish('messageAdded', 'Sorry, I couldn\'t add your habit. '
          + 'Please try again.', 4000);
      }

      sync();
    });
  }

  PubSub.subscribe('habitAdded', addHabit);
  PubSub.subscribe('habitDeleted', deleteHabit);
  PubSub.subscribe('habitCompleted', incrementHabitTaps);
  PubSub.subscribe('userAuthenticated', function(profile) {
    sync(profile.id);
  });

  HabitStore.getHabits = getHabits; 

  HabitStore.getShowableHabits = function() {
    return HabitStore.getHabits().filter(function(h) {
      return h.deleted !== true;
    });
  };

})(window, PubSub, UserStore, jQuery, config); 
