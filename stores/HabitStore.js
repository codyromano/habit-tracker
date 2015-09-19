(function(exports, PubSub) {
  'use strict';

  // TODO: Move this into its own file
  var DB = exports.DB =  {
    /** 
    * @returns {boolean}
    */
    save: function(key, value) {
      if (!localStorage) {
        return false; 
      }
      localStorage.setItem(key, JSON.stringify(value));
      return this.get(key) !== false;  
    }, 
    /**
    * @returns {object|boolean}
    */
    get: function(key) {
      var item = localStorage.getItem(key); 
      if (!item) {
        return false;
      }
      try {
        return JSON.parse(item); 
      } catch (e) {
        return false; 
      }
    }
  };

  // Debugging level cap system
  function logLevelCaps(startLevel, maxLevel, fn) {
    var level = startLevel,
        newCap,
        prevCap = 0; 

    while (level < maxLevel) {
      console.log('New points required to reach lvl %s: ', 
      level + 1, fn(level) - prevCap);
      prevCap = fn(level);
      ++level;
    }
  }

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
    return habits.map(addUtils);
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
      PubSub.publish('habitsListChanged', habits.map(addUtils));
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
          newLevel; 

      if (habit.pendingDemotions > 0) {
        demote(habit);
      }

      habit.totalTaps+= 1;
      habit.lastTap = (new Date).getTime(); 


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
    var i = 0;
    while (habits[i]) {
      if (habits[i][uniqAttr] && habits[i][uniqAttr] === uniqValue) {
        habits.splice(i, 1);
        PubSub.publish('habitListChanged', habits);
        saveHabits(); 
        return true;
      }
      ++i;
    }
    return false; 
  }

  function addHabit(habit) {
    var time = U.convertMs(habit.freq, habit.freqType);

    habits.push(habit);
    PubSub.publish('habitListChanged', habits.map(addUtils));

    PubSub.publish('messageAdded', 'You have ' + time + ' ' + habit.freqType +
     ' to ' + habit.title + '! Tap the progress bar when you\'re done.', 8000);

    saveHabits();
  }

  function saveHabits() {
    DB.save('habits', habits);
  }

  function loadHabits() {
    var stored = DB.get('habits'); 
    if (stored) {
      habits = stored.map(addUtils); 
      PubSub.publish('habitListChanged', habits); 
    }
  }

  PubSub.subscribe('habitPastDue', addPendingDemotion); 
  PubSub.subscribe('habitAdded', addHabit);
  PubSub.subscribe('habitDeleted', deleteHabit);
  PubSub.subscribe('habitCompleted', incrementHabitTaps);

  loadHabits();

  HabitStore.getHabits = getHabits; 

})(window, PubSub); 
