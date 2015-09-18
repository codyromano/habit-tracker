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

  function getHabits() {
    return habits;
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
      PubSub.publish('habitsListChanged', habits);
      return habit;
    });

    return newLevel;
  }

  function getHabitIndex(queryObj) {
    //var index = 0, expectedKey, expectedValue, actualValue;
    var index = 0, habit; 

    while ((habit = habits[index])) {
      if (U.isSuperset(habit, queryObj)) {
        return index;
      }
      habits++;
    }
    return -1;
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
      return result || h; 
    });
    saveHabits();
    PubSub.publish('habitListChanged', habits); 
    return updated; 
  }

  function incrementHabitTaps(uniqAttr, uniqValue) {
    var query = {}; 
    query[uniqAttr] = uniqValue; 

    updateHabits(query, function(habit) {
      var cap = nextLevelCap(habit.level),
          newLevel; 

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
    PubSub.publish('habitListChanged', habits);

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
      habits = stored; 
      PubSub.publish('habitListChanged', habits); 
    }
  }

  PubSub.subscribe('habitAdded', addHabit);
  PubSub.subscribe('habitDeleted', deleteHabit);
  PubSub.subscribe('habitCompleted', incrementHabitTaps);

  loadHabits();

  HabitStore.getHabits = getHabits; 

})(window, PubSub); 
