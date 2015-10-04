(function(exports) {
  var config = {
    version: '1.1.1'
  };

  exports.config = function(key) {
    return config[key] || config;
  };

})(window)
