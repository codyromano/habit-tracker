// Configure express server
var config = require('./config');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var session = require('express-session');
var methodOverride = require('method-override');
var cookieParser = require("cookie-parser");

app.use(cookieParser());
app.use(methodOverride());

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

/*
app.use(session({secret: config.PASSPORT_SECRET}));
app.use(passport.initialize());
app.use(passport.session());
*/

module.exports = app;
