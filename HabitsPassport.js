/**
* @module HabitsPassport
* @desc The Passports module configured for the Facebook authentication
* used by Habits.
*/
var passport = require('passport'),
  FacebookStrategy = require('passport-facebook').Strategy;

var fbPermsScope = ['email'];

function getFBCallbackURL(config) {
  // Use Prod by default 
  var baseURL = config.BASE_URL_PRODUCTION; 
  if (config.env === 'dev') {
    baseURL = config.BASE_URL_DEV; 
  }
  return baseURL + 'auth/facebook/callback';
}

function getFBAppId(config) {
  if (config.env === 'dev') {
    return config.FB_APP_ID_DEVO;
  } else if (config.env === 'production') {
    return config.FB_APP_ID_PROD;
  }
  throw new Error('Unknown environment name');
}

module.exports = function(config) {
  const FB_APP_ID = getFBAppId(config);

  passport.serializeUser(function(user, done) {
    done(null, user);
  });

  passport.deserializeUser(function(obj, done) {
    done(null, obj);
  });

  passport.use(new FacebookStrategy({
      clientID: FB_APP_ID,
      clientSecret: config.FB_APP_SECRET,
      callbackURL: getFBCallbackURL(config),
      profileFields: ['id', 'displayName', 'email', 'picture', 'friends']
    },
    function(accessToken, refreshToken, profile, done) {
      // TODO: Associate the user profile with a database record here
      return done(null, profile);
    }
  ));

  return passport;
};
