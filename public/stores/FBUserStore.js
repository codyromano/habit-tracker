(function(exports, PubSub) {

  var FBUserStore = exports.FBUserStore = {};

  var prodConfig = {
    appId      : '1638331476433853',
    cookie     : true,  // enable cookies to allow the server to access 
                        // the session
    xfbml      : true,  // parse social plugins on this page
    version    : 'v2.2' // use version 2.2
  };

  var devConfig = {
    appId      : '1638334596433541',
    cookie     : true,  // enable cookies to allow the server to access 
                        // the session
    xfbml      : true,  // parse social plugins on this page
    version    : 'v2.2' // use version 2.2
  };

  function statusChangeCallback(response) {
    console.log('statusChangeCallback: ', response); 

    if (response.status === 'connected') {
      FB.api('/me', function(response) {
        console.log('user authenticated: ', response);
        PubSub.publish('userAuthenticated', response);
      });
    }
  }

  FBUserStore.checkLoginState = function() {
    FB.getLoginStatus(function(response) {
      statusChangeCallback(response);
    });
  };

  window.fbAsyncInit = function() {
    var domain = document.domain, config; 

    if (domain === 'habits.elasticbeanstalk.com') {
      config = prodConfig; 
    } else if (domain === 'localhost') {
      config = devConfig; 
    } else {
      throw new Error('Invalid app domain; cannot initialize FB SDK');
    }

    FB.init(config);

    FB.getLoginStatus(function(response) {
      statusChangeCallback(response);
    });
  };

})(window, PubSub);
