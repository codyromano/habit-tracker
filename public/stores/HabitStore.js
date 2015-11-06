(function(exports, PubSub, UserStore, $, config, U) {
  'use strict';

  var remoteSyncTimeout;
  var profile = UserStore.getProfile();

  PubSub.subscribe('userProfileChanged', function(newProfile) {
    profile = newProfile;
  });

  $.get("/api/habit/", function(response) {
    response = JSON.parse(response);
    let parsed = JSON.parse(response.content);
    habits = parsed; 
    PubSub.publish('habitListChanged', parsed);
  });

  var HabitStore = exports.HabitStore = {}; 
  var habits = [];

  var HabitSocketEvents = {
    socket: null,
    currentURL: U.getCurrentURL(),

    onHabitAdded: function(habit) {
      // TODO: This needs to go after habits
      habits.push(habit);
      PubSub.publish('habitListChanged', habits);
    },

    onHabitDeleted: function(habitID) {
      habits = habits.filter(function(habit) {
        return habit.habitID !== habitID; 
      });
      PubSub.publish('habitListChanged', habits);
    },

    /**
    * @param {Object} habit The ID of the changed habit and the 
    * properties within it that have changed. 
    */
    onTapSuccess: function(changedHabitProps) {
      habits = habits.filter(function(habit) {
        if (habit.habitID == changedHabitProps.habitID) {
          habit.taps = changedHabitProps.taps;
          habit.lastTap = changedHabitProps.lastTap;
          habit.totalTaps = changedHabitProps.totalTaps;
          habit.level = changedHabitProps.level;
        }
        return habit;
      });
      PubSub.publish('habitListChanged', habits);
    },

    onTapFailure: function(err) {
      PubSub.publish('messageAdded', 'Whoops...There was an error recording ' + 
      'your progress. Please try again.', 4000);
    },

    init: function(userNamespaceID) {
      if (this.socket) { return false; }

      this.socket = io(this.currentURL + '/' + userNamespaceID); 
      this.socket.on('habit added', this.onHabitAdded.bind(this));
      this.socket.on('habit deleted', this.onHabitDeleted.bind(this));
      this.socket.on('tap success', this.onTapSuccess.bind(this));
      this.socket.on('tap failure', this.onTapFailure.bind(this));
    }
  };

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
    var habit = habits.filter(function(habit) {
      return habit.habitID === habitID;
    });

    if (!habit[0]) {
      throw new Error('No habit corresponds to habitID "%s"', habitID);
    }

    habit = habit[0];
    $.ajax({
      type: 'PUT',
      url: '/api/habit/' + habit.habitID + '/tap',
      data: {
        habit: habit
      }
    });
  }

  function deleteHabit(habitID) {
    $.ajax({
      url: '/api/habit/' + habitID,
      type: 'DELETE'
    }).done(function(result) {
    });
  }

  function addHabit(habit) {
    var time = U.convertMs(habit.freq, habit.freqType);

    $.post("/api/habit/", {
      content: habit.content, 
      freq: habit.freq
    }).done(function(result) {
      result = JSON.parse(result);

      if (result.success === true) {
        habit.habitID = result.content.habitID; 

        PubSub.publish('messageAdded', 'You have ' + time + ' ' + habit.freqType +
        ' to ' + habit.content + '! Tap the progress bar when you\'re done.', 8000);
      } else {
        PubSub.publish('messageAdded', 'Sorry, I couldn\'t add your habit. '
          + 'Please try again.', 4000);
      }
    });
  }

  PubSub.subscribe('habitAdded', addHabit);
  PubSub.subscribe('habitDeleted', deleteHabit);
  PubSub.subscribe('habitCompleted', incrementHabitTaps);
  PubSub.subscribe('userAuthenticated', function(profile) {
    HabitSocketEvents.init(profile.ioNamespaceID);
  });

  HabitStore.getHabits = getHabits; 

  HabitStore.getShowableHabits = function() {
    return HabitStore.getHabits().filter(function(h) {
      return h.deleted !== true;
    });
  };

})(window, PubSub, UserStore, jQuery, config, U); 
