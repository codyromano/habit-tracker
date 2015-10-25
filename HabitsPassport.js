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

function getFBConfig(config) {
  if (config.env === 'dev') {
    return config.FB_DEVO; 
  } else if (config.env === 'production') {
    return config.FB_PROD;
  }
  throw new Error('Unknown environment name');
}

module.exports = function(config) {
  var fbConfig = getFBConfig(config);

  passport.serializeUser(function(user, done) {
    done(null, user);
  });

  passport.deserializeUser(function(obj, done) {
    done(null, obj);
  });

  passport.use(new FacebookStrategy({
      clientID: fbConfig.APP_ID,
      clientSecret: fbConfig.SECRET,
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
