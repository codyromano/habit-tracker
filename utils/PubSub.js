/**
* @module PubSub
*/
(function (exports) {
  'use strict';

  exports.PubSub = (function () {
    var callbacks = {};

    return {
      subscribe: function (eventName, callback) {
        callbacks[eventName] = callbacks[eventName] || [];
        callbacks[eventName].push(callback);
      },
      publish: function (eventName) {
        var args = [].slice.call(arguments);

        args.shift(); // Remove eventName

        if (callbacks[eventName]) {
          callbacks[eventName].forEach(function (cb) {
            cb.apply(undefined, args);
          });
        } else {
          console.warn("No modules are listening to the event '%s'", eventName);
        }
      }
    };
  })();
})(window);
