(function(exports) {
  'use strict';

  var U = exports.U = {}; // Utilities

  U.addClass = function(el, className) {
    el.classList.add(className);
    return el;
  };  

  U.hide = function(el) {
    U.addClass(el, 'hidden');
    return el;
  };

  U.extend = function(objA, objB) {
    for (var key in objB) {
      objA[key] = objB[key];
    }
    return objA;
  };

  U.getDomain = function() {
    var domain = document.domain,
        domainErrorMsg = 'Unknown / unauthorized domain'; 

    if (domain === 'habits.elasticbeanstalk.com') {
      return 'prod';
    }
    if (domain === 'localhost') {
      return 'devo';
    }
    if (domain === '127.0.0.1') {
      domainErrorMsg+=': To make the Facebook API happy, please hit "http://localhost"' + 
        ' instead of 127.0.0.1'; 
    }
    throw new Error(domainErrorMsg); 
  };
 
  /**
  * @desc Check if a child object has all the properties
  * of its parent and that the properties are the same. The child
  * may have more but not fewer properties.
  */
  U.isSuperset = function(childObj, parentObj) {
    for (var key in parentObj) {
      if (childObj[key] === undefined || parentObj[key] != childObj[key]) {
        return false;
      }
    }
    return true; 
  };

  /**
  * @desc Generates a unique enough, auto-incrementing number
  * @returns {Integer}
  */
  U.unique = (function() {
    var autoIncrement = 0;
    return function() { 
      var rand = Math.round(Math.random() * Math.pow(1000, 2));
      return [++autoIncrement, rand, new Date().getTime()].join(''); 
    };
  })();

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

  U.abbrev = function(str, limit) {
    if (typeof str !== 'string') { return; }
    if (str.length > limit) {
      str = str.slice(0, limit -3) + '...';
    }
    return str;
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
