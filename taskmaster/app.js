
/**
 * Module dependencies.
 */
var express = require('express');

var app = module.exports = express.createServer();

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
  require.paths.unshift(__dirname + '/.');
});

app.configure('test', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
  process.env.DATABASE_URL = "postgres://shane:rattlers@localhost/taskserver-test";
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes
app.get(/^\/(index)?$/, function(req, res) {
	var index = require("./actions/index.js");
	index.route(req, res);
});

app.get('/login', function(req, res) {
	var index = require("./actions/login.js");
	index.route(req, res, true); // isGet = true
});

app.post('/login', function(req, res) {
	var index = require("./actions/login.js");
	index.route(req, res, false); // isGet = false
});

app.get('/logout', function(req, res) {
	req.session.user = undefined;
	res.redirect('login');
});

app.get('/register_user', function(req, res) {
	var index = require("./actions/register.js");
	index.route(req, res, false); // isPost = false
});

app.post('/register_user', function(req, res) {
	var index = require("./actions/register.js");
	index.route(req, res, true); // isPost = true
});

app.post('/do_chore', function(req, res) {
	var submitChore = require("./actions/submitChore.js");
	submitChore.route(req, res, "createChore");
});

app.get('/show', function(req, res) {
	var submitChore = require("./actions/submitChore.js");
	submitChore.route(req, res, "get");
});

app.post('/add_friend', function(req, res) {
	var friends = require("./actions/friends.js");
	friends.route(req, res, "add");
});

app.get('/friends', function(req, res) {
	var friends = require("./actions/friends.js");
	friends.route(req, res, "get");
});

app.get("/friend_approve/:id", function(req, res) {
	var friends = require("./actions/friends.js");
	friends.route(req, res, "approve");
});

app.get("/friend_deny/:id", function(req, res) {
	var friends = require("./actions/friends.js");
	friends.route(req, res, "deny");
});

app.get('/flash', function(req, res) {
	req.flash('error', "Testing an error");
	var index = require("./actions/login.js");
	index.route(req, res, true); // isGet = true
});

app.get('/api/getUserPoints/:id', function(req, res) {
	var submitChore = require("./actions/submitChore.js");
	submitChore.route(req, res, "getUserPoints");
});

// So that 'require' for tests doesn't auto start the server
if (!module.parent) {
	// port is provided by heroku if running through that.
	var port = process.env.PORT || 3000;
	app.listen(port);
	console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
}


