(function(exports) {
  'use strict';

  var U = exports.U = {}; // Utilities

  U.getMonthName = function(n) {
    var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "June",
      "July", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    return monthNames[n];
  };

  U.getDayName = function(n) {
    var days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    return days[n];
  };

  U.getFriendlyTime = function(dateObj) {
    var hours = dateObj.getHours(),
        minutes = dateObj.getMinutes(),
        suffix = (hours >= 12) ? 'pm' : 'am';
    var result;

    if (hours === 0) {
      result = '12';
    } else if (hours > 12) {
      result = '' + (hours - 12); 
    } else {
      result = hours;
    }
    return result + suffix;
  };

  /**
  * @desc Create a 1-dimensional hash table from an array
  * @param {Function} keyFn Used to derive a string key for each item.
  * @returns {Object}
  */
  U.toHashTable = function(array, keyFn) {
    return array.reduce(function(table, item) {
      var key = keyFn(item); 
      if (typeof key !== 'string') {
        throw new Error('Your key finding function must' + 
        ' return a string');
      }
      table[key] = table[key] || [];
      table[key].push(item);
      return table; 
    }, {});
  };

  U.countDuplicateKeys = function(objectArray, objectKey) {
    var dupes = 0;
    var table = U.toHashTable(objectArray, function(item) {
      return item[objectKey];
    });

    for (var hashKey in table) {
      /* Remove one from the count because the original should not
      be considered a duplicate. */
      dupes+= Math.max(0, table[hashKey].length - 1);
    }
    return dupes;
  };

  /**
  * @desc Given an array of objects, find the first object
  * with all of the specified key/value pairs. 
  *
  * @param {Array} objectArray
  * @param {Object} expectedKeyVals
  */
  U.firstWhere = function(objectArray, expectedKeyVals) {
    var object, key, i, l;
    for (i=0, l=objectArray.length; i<l; i++) {
      object = objectArray[i];

      // Return the object if it has all expected key/value pairs
      for (key in expectedKeyVals) {
        if (!object[key] || object[key] !== expectedKeyVals[key]) {
          break;
        }
        return object;
      }
    }
  };

  U.getCurrentURL = function() {
    return location.protocol + '//' + location.hostname + 
      (location.port ? ':'+location.port: '');
  };

  U.addClass = function(el, className) {
    el.classList.add(className);
    return el;
  };  

  U.mapKeyValues = function(object, fn) {
    for (var key in object) {
      object[key] = fn(key, object[key]);
    }
    return object; 
  };

  U.ordinalSuffix = function(i) {
    var j = i % 10,
        k = i % 100;
    if (j == 1 && k != 11) {
        return i + "st";
    }
    if (j == 2 && k != 12) {
        return i + "nd";
    }
    if (j == 3 && k != 13) {
        return i + "rd";
    }
    return i + "th";
  };

  U.text = function(el, str) {
    var prop = 'innerText' in el ? 'innerText' : 'textContent';
    el[prop] = str;
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

    if (domain == '159.203.245.224') {
      return 'prod';
    }
    if (domain == 'localhost') {
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
