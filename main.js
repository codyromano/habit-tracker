/********** Modules ************/

// Utilities 
var util = require('util'),
    _ = require('underscore');

// Web server and file system
var express = require('express');

// Basic Configuration
var config = require('./config');

var db = require('./db');

// Social login
var passport = new require('./HabitsPassport')(config);
var fbPermsScope = ['email'];

// Session handlers and parsers
var bodyParser = require('body-parser'),
  session = require('express-session'),
  methodOverride = require('method-override'),
  cookieParser = require("cookie-parser");

// Models
var User = require('./models/User'),
    user;

// App routes 
var Habit = require('./habit');
var habit = new Habit();

// Build system 
var gulpfile = require('./gulpfile');

// Configure express server
var app = require('./app');

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

app.get('/welcome', function(req, res) {
  // TODO: Show a welcome screen for non-logged-in users
  res.render('index', {userID: '0'});
});

app.get('/', ensureAuthenticated, function(req, res) {
  user = new User(config, db, req.user.id, req.user);
  user.save();
  res.render('index', {userID: req.user.id});
});

app.get('/account', ensureAuthenticated, function(req, res){
  // TODO: Implement this as part of the upcoming user profile feature
});

app.get('/auth/facebook',
  passport.authenticate('facebook', { scope: fbPermsScope }));

app.get('/auth/facebook/callback', 
  passport.authenticate('facebook', { scope: fbPermsScope, failureRedirect: '/welcome' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

function ensureAPIAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  var errorObj = {success: false, message: 'This API method requires login'};
  res.send(JSON.stringify(errorObj));
}

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/welcome')
}

app.put('/api/habit/:habitID/tap', ensureAPIAuthenticated, function(req, res) {
  habit.addTap(config, user, db, req.body.habit, req, res);
});

app.delete('/api/habit/:habitID', ensureAPIAuthenticated, function(req, res) {
  habit.remove(config, user, db, req, res);
});

app.post('/api/habit/', ensureAPIAuthenticated, function(req, res) {
  // Save a single habit record
  habit.save(config, user, db, req, res);
});

app.get('/api/habit/', ensureAPIAuthenticated, function(req, res) {
  habit.get(config, user, db, req, res); 
});

/* The following route is deprecated in favor of /api/habit/ */
app.get('/api/habits/:id', ensureAPIAuthenticated, function(req, res) {
  habit.getAll(config, user, db, req, res); 
});

app.get('/api/user/', ensureAPIAuthenticated, function(req, res) {
  user.getProfile().then(function(user) {
    res.send(JSON.stringify(user));
  });
});

module.exports = app;
