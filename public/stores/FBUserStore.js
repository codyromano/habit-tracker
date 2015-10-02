(function(exports, PubSub) {

  var FBUserStore = exports.FBUserStore = {};

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
    FB.init({
      appId      : '1638334596433541',
      cookie     : true,  // enable cookies to allow the server to access 
                          // the session
      xfbml      : true,  // parse social plugins on this page
      version    : 'v2.2' // use version 2.2
    });

    FB.getLoginStatus(function(response) {
      statusChangeCallback(response);
    });
  };

})(window, PubSub);
