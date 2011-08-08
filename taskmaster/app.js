
/**
 * Module dependencies.
 */
var express = require('express');

var app = module.exports = express.createServer();

// Global root object
var taskServer = {};

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
	app.use(express.cookieParser());
	app.use(express.session({ secret: "hendercaust" }));
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes
app.get('/', function(req, res) {
	var index = require("./actions/index.js");
	index.route(req, res);
});

app.get('/login', function(req, res) {
	var index = require("./actions/login.js");
	index.route(req, res, true); // isGet = true
});

app.post('/login_submit', function(req, res) {
	var index = require("./actions/login.js");
	index.route(req, res, false); // isGet = false
});

app.post('/register_user', function(req, res) {
	var index = require("./actions/login.js");
	index.route(req, res, false, true); // isGet = false, register = true
});

app.post('/do_chore', function(req, res) {
	var submitChore = require("./actions/submitChore.js");
	submitChore.route(req, res, true);
});

app.get('/show', function(req, res) {
	var submitChore = require("./actions/submitChore.js");
	submitChore.route(req, res, false);
});

// port is provided by heroku if running through that.
var port = process.env.PORT || 3000;
app.listen(port);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
