 (function(exports, PubSub, U) {
  var FBUserStore = exports.FBUserStore = {};

  var facebookConfigProd = {
      appId      : '1638331476433853',
      xfbml      : true,
      version    : 'v2.4'
  };

  var facebookConfigDevo = {
    appId      : '1638334596433541',
    cookie     : true, 
    xfbml      : true,  
    version    : 'v2.2' 
  };

  function statusChangeCallback(response) {
    /* TODO: Handle the scenario of a user logging out
    on Facebook.com and returning to Habit Tracker. Application
    state needs to be updated for this in several areas. */
  }

  FBUserStore.checkLoginState = function() {
    FB.getLoginStatus(function(response) {
      statusChangeCallback(response);
    });
  };

  window.fbAsyncInit = function() {
    var config, domain = U.getDomain(); 

    if (domain === 'prod') {
      config = facebookConfigProd; 
    } else if (domain === 'devo') {
      config = facebookConfigDevo; 
    }

    FB.init(config); 
    FB.getLoginStatus(function(response) {
      statusChangeCallback(response);
    });
  };

  // Load Facebook SDK
  (function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
  }(document, 'script', 'facebook-jssdk'));

})(window, PubSub, U);
