(function(exports) {
  'use strict';

  var U = exports.U = {}; // Utilities

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
