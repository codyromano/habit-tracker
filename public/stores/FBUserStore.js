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

})(window, PubSub, U);
