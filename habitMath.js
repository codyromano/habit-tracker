/**
* @module HabitMath
* @desc Math and logic related to leveling up habits 
*/

/**
* @var {Number} Controls how difficult it is to level up over time
*/
var levelCapExp = 1.5; 

/**
* @returns {Number} Taps required to reach a level
*/
function getLevelCap(level) {
  return Math.floor(Math.pow(level + 1, levelCapExp)); 
}

/**
* @returns {Number} Get what a user's level *should* be, given how 
* many times he/she has tapped a habit. This doesn't take into account the 
* levels lost by slacking off. 

* This method is exposed only for unit testing and private
* calculations. Call 'getHabitLevel' to get the real user-facing level.
*/
function getBaseLevelByTaps(tapsTotal) {
  var result = Math.floor(Math.log(tapsTotal) / Math.log(levelCapExp));
  return Math.max(1, result);
}

/**
* @param {Array} tsArray Timestamps corresponding to taps on a habit
* @param {Number} freq How often in millseconds a tap must occur 
* @returns {Number} User's current level for a given habit 
*/ 
function getHabitLevel(tsArray, freq) {

  var currentTime = new Date().getTime(),
      level = 1,
      consecutiveTaps = 0,
      totalTaps = tsArray.length,
      levelsLostRecently = 0,
      tsArrayWithoutLast;

  if (typeof freq !== 'number' || freq < 1) {
    throw new Error('Frequency must be an integer greater than zero.');
  }

  if (totalTaps >= 2) {
    // The most recent timestamp has no next element for comparison
    tsArrayWithoutLast = tsArray.slice(0, totalTaps - 1); 

    tsArrayWithoutLast.forEach(function(timeA, index) {
      var timeB = tsArray[index + 1], 
          levelsLost; 

      if (timeB - timeA <= freq) {
        ++consecutiveTaps; 
      } else {
        levelsLost = Math.floor((timeB - timeA) / freq); 

        /* To reduce a player's level, lower his or her consecutive tap 
        count to the minimum number of taps required for a certain level. 
        A level can't be less than 1. */
        consecutiveTaps = getLevelCap(Math.max(1, level - levelsLost));
      }
      level = getBaseLevelByTaps(consecutiveTaps);
    });
  }

  /* Finally, account for levels lost between most recent timestamp and now. 
  E.g. If freq is a day and it's been 3 days, the user lost 3 levels. */
  levelsLostRecently = Math.floor(
    (currentTime - tsArray[totalTaps - 1]) / freq
  );
  level = Math.max(1, level - levelsLostRecently); 

  return level;
}

module.exports = {
  getLevelCap: getLevelCap,
  getHabitLevel: getHabitLevel,
  getBaseLevelByTaps: getBaseLevelByTaps
};
