(function(exports, PubSub, UserStore, $, config) {
  'use strict';

  var profile = UserStore.getProfile(); 

  PubSub.subscribe('userProfileChanged', function(newProfile) {
    profile = newProfile;
  });

  /**
  TODO: Replace POST request in 'sync' with the method below.
  This method is safer and more efficient because it only affects
  a single record, but I need to do prepare a few other routes before
  migrating to this approach.
  **/ 
  /*
  function testPostHabit() {
    $.post("/api/habit/", {
      userID: 100,
      title: 'My new habit',
      content: 'My habit content',
      freq: 60000
    });
  }
  */

  function sync(profileId) {

    new Promise(function(resolve, reject) {

      $.get("/api/habits/" + profileId, function(response) {
        try {
          response = JSON.parse(response);
          resolve(JSON.parse(response.content));
        } catch (e) {
          reject('Error parsing JSON');
        }
      }).error(function(message) {
        reject(message);
      });

    }).then(function(habitsFromServer) {

      habits = pruneOldItems(habits, habitsFromServer).map(addUtils);
      PubSub.publish('habitListChanged', habits);

      var dbItem = {
        userId: profileId,
        title: 'all-user-habits',
        content: JSON.stringify(habits)
      };

      return new Promise(function(resolve, reject) {
        $.post( "/api/habits/", dbItem)
          .done(resolve)
          .error(reject);
      });
    }).then(function() {
      setTimeout(sync.bind(undefined, profileId), 7000);
    });
  }

  // TODO: Move this into its own file
  var DB = exports.DB =  {
    remoteSaveInProgress: false,
    remoteSaveTimeout: null,
    remoteSaveRetry: 5000,
    lastRemoteSave: new Date().getTime(),

    requestRemoteSave: function(profileId, stringVal) {
      var _self = this; 
      var dbItem = {
        userId: profileId,
        title: 'all-user-habits',
        content: stringVal
      };
      var rateLimitOK = new Date().getTime() - this.lastRemoteSave
         >= this.remoteSaveRetry;

      // Backoff and retry if a save is in progress
      if (this.remoteSaveInProgress || !rateLimitOK) {
        clearTimeout(this.remoteSaveTimeout); 
        this.remoteSaveTimeout = setTimeout(function() {
          _self.requestRemoteSave(profileId, stringVal); 
        }, this.remoteSaveRetry);
        return;
      }

      this.remoteSaveInProgress = true; 

      if (!dbItem.content || !dbItem.content.length) {
        throw new Error('No content to POST');
      }
    },

    /** 
    * @returns {boolean}
    */
    save: function(key, value) {
      var _self = this, 
          dbItem, ajax, 
          valueAsString = JSON.stringify(value);

      if (profile.id) {
        this.requestRemoteSave(profile.id, valueAsString); 
      }
      return this.get(key) !== false;  
    }, 
    /**
    * @returns {object|boolean}
    */
    get: function(key) {
      /**
      * @todo Update or remove method
      */
    }
  };

  var HabitStore = exports.HabitStore = {}; 
  var habits = [];

  /**
  * @desc Add utility methods to a habit object
  */
  function addUtils(habitObj) {
    /**
    * @desc Encapsulation for getting / setting habit properties
    */
    (!habitObj.hasOwnProperty('attr')) && (habitObj.attr = function(objAttr, objVal) {
      if (objVal !== undefined) {
        switch (objAttr) {
          case 'pendingDemotions': 
            // A demotion can't be great enough to make the level negative
            if (this.level - objVal < 1) {
              this.pendingDemotions = this.level - 1;
            } else {
              this.pendingDemotions = objVal; 
            }
          break;
          default: 
            this[objAttr] = objVal;
          break;
        }
        return; 
      }
      
      switch (objAttr) {
        case 'level':
          return this.level - this.pendingDemotions;
        break;
        default:
          return this[objAttr];
        break;
      }
    });

    return habitObj;
  }

  function getHabits() {
    var result = habits;
    return result.map(addUtils);
  }

  function nextLevelCap(currentLevel) {
    return Math.ceil(currentLevel + Math.pow(currentLevel, 1.5));
  }

  function readyForLevelUp(level, totalTaps) {
    return totalTaps >= nextLevelCap(level); 
  }

  function levelProgress(level, totalTaps) {
    var cap = nextLevelCap(level),
        prevCap = nextLevelCap(level - 1); 

    if (totalTaps === 0) { return 0; }
    return Math.floor( ((totalTaps - prevCap) / (cap-prevCap)) * 100); 
  }

  function levelUp(habit) {
    var newLevel; 

    updateHabits({id: habit.id}, function(habit) {
      newLevel = ++habit.level;
      saveHabits();
      PubSub.publish('habitsListChanged', getHabits());
      return habit;
    });

    return newLevel;
  }

  function addPendingDemotion(habitId, intervalsMissed) {
    updateHabits({id: habitId}, function(habit) {
      var demoteBy = intervalsMissed;

      // Demote the user by a level for each progress interval (s)he missed
      if (habit.level - intervalsMissed < 1) {

        // In general we want to use 'attr' for getting or setting properties; 
        // Here I'm referring to the raw level prop because the result of .attr('level'),
        // adjusts for pending demotions, and we don't want to account for them twice.
        demoteBy = habit.level - 1; 
      }

      habit.attr('pendingDemotions', demoteBy);
      PubSub.publish('habitHasPendingDemotion:' + habit.id, habit); 
      return habit; 
    });
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
      return addUtils(result);
    });
    saveHabits();
    PubSub.publish('habitListChanged', habits); 
    return updated; 
  }

  function demote(habit) {
    updateHabits({id: habit.id}, function(h) {
      var newTotalTaps = Math.max(0, nextLevelCap((h.level - 1) - h.pendingDemotions)); 

      // No demotions to apply
      if (isNaN(h.pendingDemotions) || h.pendingDemotions < 1) {
        return h;
      }

      // Reduce level by the number of intervals the user missed,
      // but don't set a level below 0
      h.attr('level', Math.max(1, h.level - h.pendingDemotions));
      h.attr('totalTaps', newTotalTaps);

      // Reset counter because demotions have been applied
      h.attr('pendingDemotions', 0); 
      return h;
    });
  }

  function incrementHabitTaps(uniqAttr, uniqValue) {
    var query = {}; 
    query[uniqAttr] = uniqValue; 

    updateHabits(query, function(habit) {
      var cap = nextLevelCap(habit.level),
          now = new Date().getTime(),
          newLevel; 

      if (habit.pendingDemotions > 0) {
        demote(habit);
      }

      habit.totalTaps+= 1;
      habit.lastTap = now;

      // Add this to the history of taps on the habit
      if (!habit.taps) {
        habit.taps = [];
      }
      habit.taps.push(now);

      if (readyForLevelUp(habit.level, habit.totalTaps)) {
        newLevel = levelUp(habit);
        PubSub.publish('messageAdded', 'You reached level ' + newLevel + 
          ' in "' + habit.title + '"! Keep going to form a habit.', 4000); 
      } else {
        PubSub.publish('messageAdded', 
          'Progress toward next level: ' + 
          levelProgress(habit.level, habit.totalTaps) + '%', 
          3000); 
      }

      saveHabits();
      PubSub.publish('habitListChanged', habits);
      return habit; 
    });
  }

  function deleteHabit(uniqAttr, uniqValue) {
    var recordDeleted = false,
        query = {}; 

    query[uniqAttr] = uniqValue;

    updateHabits(query, function(habit) {
      habit.deleted = true; 
      recordDeleted = true; 
      return habit;
    });

    if (recordDeleted) {
      PubSub.publish('habitListChanged', getHabits());
      saveHabits();
    }
    return recordDeleted;
  }

  function addHabit(habit) {
    var time = U.convertMs(habit.freq, habit.freqType);
    habit.timeLastUpdated = new Date().getTime();
    habit.version = config('version');

    habits.push(habit);
    PubSub.publish('habitListChanged', getHabits());

    PubSub.publish('messageAdded', 'You have ' + time + ' ' + habit.freqType +
     ' to ' + habit.title + '! Tap the progress bar when you\'re done.', 8000);

    saveHabits();
  }

  function saveHabits() {
    DB.save('habits', habits);
  }

  function toHashTable(objectArray, keyProperty) {
    return objectArray.reduce(function(result, object) {
      var key = object[keyProperty];
      result[key] = result[key] || []; 
      return result[key].push(object) && result; 
    }, {});
  }

  function sortHabitsByTap(a, b) {
    if (a.timeLastUpdated === b.timeLastUpdated) { 
      return 0; 
    }
    return (a.timeLastUpdated > b.timeLastUpdated) ? -1 : 1;
  }

  function pruneOldItems(versionA, versionB) {
    var result = [], newestItem;
    var hashTable = toHashTable(versionA.concat(versionB), 'id');

    for (var key in hashTable) {
      newestItem = hashTable[key]
        .sort(sortHabitsByTap)[0];

      result.push(newestItem);
    } 

    return result;
  }

  PubSub.subscribe('habitPastDue', addPendingDemotion); 
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
