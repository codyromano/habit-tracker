(function(exports, PubSub) {

  var UserStore = exports.UserStore = {}; 

  var user = {
    id: null,
    name: null
  };

  // Return a specific attribute or the whole object
  UserStore.getProfile = function(key) {
    return user[key] || user; 
  };

  function updateProfile(props) {
    for (var key in props) {
      user[key] = props[key];
    }

    PubSub.publish('userProfileChanged', user); 

    console.assert(
      user.id && user.name,
      'user attributes were added'
    );
  } 

  PubSub.subscribe('userAuthenticated', updateProfile); 

})(window, PubSub); 
