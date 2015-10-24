var express          =  require('express'),
    fs               =  require('fs'),
    path             =  require('path'),
    AWS              =  require('aws-sdk'),
    bodyParser       =  require('body-parser'),
    passport         =  require('passport'),
    FacebookStrategy = require('passport-facebook').Strategy
    util             =  require('util'),
    session          =  require('express-session'),
    methodOverride   = require('method-override'),
    cookieParser     = require("cookie-parser")
    _                =  require('underscore'),
    Habit            =  require('./habit'),
    gulpfile         =  require('./gulpfile');

var habit        =  new Habit();

var rootDir = path.dirname(require.main.filename);
var pathToConfig = './appConfig.json';

// General config including params needed by AWS
var config = fs.readFileSync(pathToConfig, 'utf8');
config = JSON.parse(config);

/********** Passport Facebook login  ************/

var fbPermsScope = ['email'];

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Facebook profile is serialized
//   and deserialized.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

// Use the FacebookStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Facebook
//   profile), and invoke a callback with a user object.
passport.use(new FacebookStrategy({
    clientID: config.FB_APP_ID,
    clientSecret: config.FB_APP_SECRET,
    callbackURL: "http://localhost:" + 8081 + "/auth/facebook/callback",
    profileFields: ['id', 'displayName', 'email', 'picture', 'friends']
  },
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      // To keep the example simple, the user's Facebook profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Facebook account with a user record in your database,
      // and return that user instead.
      return done(null, profile);
    });
  }
));

/********** /Passport Facebook login  ************/

// AWS and DynamoDB configuration
AWS.config.update({
  accessKeyId: config.AWS_ACCESS_KEY_ID,
  secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
  region: config.AWS_REGION
});
var db = new AWS.DynamoDB({region: config.AWS_REGION});

// Configure express server
var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(cookieParser());
app.use(methodOverride());

app.use(session({secret: config.PASSPORT_SECRET}));
app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

// Designate 'public' as a static directory
app.use(express.static('public'));

// Treat '/' as equivalent to 'public/index.html'
app.get('/', function(req, res) {
  if (req.user && req.user.photos) {
    req.user.profilePhoto = req.user.photos[0].value;
  }
  res.render('index', {user: req.user});
});

app.get('/account', ensureAuthenticated, function(req, res){
  console.log('user in /account: ', req.user);
  //res.render('account', { user: req.user });
});

app.get('/login', function(req, res){
  res.render('login', { user: req.user });
});

// GET /auth/facebook
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Facebook authentication will involve
//   redirecting the user to facebook.com.  After authorization, Facebook will
//   redirect the user back to this application at /auth/facebook/callback
app.get('/auth/facebook',
  passport.authenticate('facebook', { scope: fbPermsScope }),
  function(req, res){
    // The request will be redirected to Facebook for authentication, so this
    // function will not be called.
  });

// GET /auth/facebook/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/facebook/callback', 
  passport.authenticate('facebook', { scope: fbPermsScope, failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/auth/facebook')
}

app.post('/api/habits/', habit.saveAll.bind(undefined, config, db));
app.get('/api/habits/:id', habit.getAll.bind(undefined, config, db)); 

module.exports = app;
