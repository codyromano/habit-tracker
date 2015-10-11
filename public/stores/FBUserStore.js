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

  /**
  * @desc Replaces the Facebook Login button with a profile picture 
  * @todo This needs to be a component; stores should not affect the DOM
  */
  PubSub.subscribe('userAuthenticated', function(profile) {
    var img = document.createElement('img'),
        fbWrapper = document.querySelector('.fb-button-wrapper'),
        loginButton = document.querySelector('.fb_iframe_widget');

    if (!fbWrapper || !loginButton) {
      throw new Error('FB login button not found in the DOM');
    }

    U.hide(loginButton);
    U.addClass(img, 'profile-picture');

    img.onload = function() {
      fbWrapper.appendChild(img);
    };
    img.src = profile.profilePicture;
  });

  /**
  * @returns {Object} User full name and Facebook ID
  */
  function getBasicProfile(resultObj) {
    resultObj = resultObj || {}; 

    return new Promise(function(resolve, reject) {
      FB.api('/me', function(response) {
        resultObj = U.extend(resultObj, response);
        resolve(response);
      });
    });
  }

  function getProfilePic(resultObj) {
    resultObj = resultObj || {}; 

    return new Promise(function(resolve, reject) {
      FB.api('/me/picture', function(response) {
        resultObj.profilePicture = response.data.url; 

        if (response && !response.error) {
          resolve(resultObj); 
        } else {
          reject(resultObj);
        }
      });
    });
  }

  function statusChangeCallback(response) {
    if (response.status === 'connected') {
      getBasicProfile()
        .then(getProfilePic)
        .then(function(profile) {
          PubSub.publish('userAuthenticated', profile);
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

  // Facebook SDK
  (function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
  }(document, 'script', 'facebook-jssdk'));

})(window, PubSub, U);
