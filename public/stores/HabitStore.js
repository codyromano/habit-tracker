(function(exports, PubSub, UserStore, $, config, U) {
  'use strict';

  var remoteSyncTimeout;
  var profile = UserStore.getProfile();

  PubSub.subscribe('userProfileChanged', function(newProfile) {
    profile = newProfile;
  });

  var loadHabitsRetryTimer = null;

  /* This regular HTTP GET fires only once after the initial 
  user authentication. We rely on web sockets to manage subsequent updates. */
  function loadHabitsFromServer(retries) {
    retries = retries || 1;

    let maxRetries = 10; 

    let retryInSeconds = Math.floor(Math.exp(retries, 1.5));
    let retryTimerSet = false;

    if (retries >= maxRetries) {
      PubSub.publish("Sorry, I couldn't load your profile. Please reload the page.", 4000);
      return false;
    }

    $.ajax({
      url: "/api/habit/",
      timeout: 8000,

      error: function(req, errorType) {
        var _self = this;

        if (retryTimerSet) {
          return;
        }
        retryTimerSet = true;
        let message = "Retrying in " + retryInSeconds + " seconds.";

        if (retries === 1) {
          // Only explain this on the first retry or it becomes repetitive
          message = "Sorry your profile is taking a while to load. " + message;
        }

        PubSub.publish("messageAdded", message, 3000);

        clearTimeout(loadHabitsRetryTimer);
        loadHabitsRetryTimer = setTimeout(
          loadHabitsFromServer.bind(undefined, ++retries),
          retryInSeconds * 1000);
      },
      success: function(response) {
        response = JSON.parse(response);
        let parsed = JSON.parse(response.content);
        habits = parsed; 
        PubSub.publish('habitListChanged', parsed);
      }
    });
  }

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
      var progress = changedHabitProps.progress;

      var habitUpdated = updateHabits({habitID: changedHabitProps.habitID},
       function(habit) {
        habit.taps = changedHabitProps.taps;
        habit.lastTap = changedHabitProps.lastTap;
        habit.totalTaps = changedHabitProps.totalTaps;
        habit.level = changedHabitProps.level;
        return habit;
      });

      // updateHabits returns an array of habits that were updated 
      if (habitUpdated.length !== 1) {
        console.error('Exactly one client-side habit record should have ' +
          'been affected by the update, but 0 or >1 updates occurred.');
        PubSub.publish('messageAdded', 'Whoops...error updating' +
        ' your progress. Please try again.', 2500);
        return false;
      }

      habitUpdated = habitUpdated[0];

      /* Progress of zero on tap actually indicates a level up. This
      may be counterintuitive if you're expecting 100. Please see
      the habitMath module if you want a deep dive into 
      why it works this way. */
      if (progress === 0) {
        PubSub.publish('messageAdded', 'You reached level ' + 
          habitUpdated.level + ' in "' + habitUpdated.content + 
          '"!', 4000);
      } else if (progress > 0) {
        PubSub.publish('messageAdded', 'Level progress: ' + 
          changedHabitProps.progress + '%', 4000);
      } 

      return true;
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

        PubSub.publish('messageAdded', 'The clock is ticking! Tap the timer' +
        ' and hit "Mark As Done" before the bar runs out.', 8000);

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
    loadHabitsFromServer();
  });

  HabitStore.getHabits = getHabits; 

  HabitStore.getShowableHabits = function() {
    return HabitStore.getHabits().filter(function(h) {
      return h.deleted !== true;
    });
  };

})(window, PubSub, UserStore, jQuery, config, U); 
