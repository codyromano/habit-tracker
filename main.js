/********** Modules ************/

// Utilities 
var util = require('util'),
    _ = require('underscore');

// Web server and file system
var express = require('express'),
    fs = require('fs'),
    path = require('path');

// Basic Configuration
var rootDir = path.dirname(require.main.filename);
var pathToConfig = './appConfig.json';
var config = fs.readFileSync(pathToConfig, 'utf8');
config = JSON.parse(config);
config.env = (process.env.NODE_ENV=='dev') ? 'dev' : 'production';

// Social login
var passport = new require('./HabitsPassport')(config);
var fbPermsScope = ['email'];

// Session handlers and parsers
var bodyParser = require('body-parser'),
  session = require('express-session'),
  methodOverride = require('method-override'),
  cookieParser = require("cookie-parser");

// Databases
var AWS = require('aws-sdk');

// App routes 
var Habit = require('./habit');
var habit = new Habit();

// Build system 
var gulpfile = require('./gulpfile');

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
  // TODO: Implement this as part of the upcoming user profile feature
});

app.get('/login', function(req, res){
  res.render('login', { user: req.user });
});

app.get('/auth/facebook',
  passport.authenticate('facebook', { scope: fbPermsScope }));

app.get('/auth/facebook/callback', 
  passport.authenticate('facebook', { scope: fbPermsScope, failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/auth/facebook')
}

app.post('/api/habits/', habit.saveAll.bind(undefined, config, db));
app.get('/api/habits/:id', habit.getAll.bind(undefined, config, db)); 

module.exports = app;
