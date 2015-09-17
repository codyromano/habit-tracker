(function(exports) {
  'use strict';

  var U = exports.U = {}; // Utilities

U.sortByProp = function(objA, objB, prop, order) {
  var valA = objA[prop],
      valB = objB[prop];

  if (valA === valB) { return 0; }

  switch (order) {
    case 'ascend': 
      return (valA > valB) ? -1 : 1; 
    break;
    default: 
      // Descending order by default
      return (valA > valB) ? 1 : -1; 
    break;
  }
};

  U.convertMs = function(ms, outputFormat) {
    var time; 
    switch (outputFormat) {
      case 'minutes': 
        time = ms / 60 / 1000;
      break;
      case 'hours':
        time = ms / 60 / 60 / 1000; 
      break;
      case 'days':
        time = ms / 60 / 60 / 24 / 1000; 
      break;
    }
    return time;
  };

  U.getClassStr = function(classes) {
    var result = []; 
    for (var cl in classes) {
      if (classes[cl] === true) {
        result.push(cl); 
      }
    }
    return result[0] ? result.join(' ') : ''; 
  };

})(window);
