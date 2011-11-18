/**
 * Module dependencies.
 */
var express = require('express');
var fs = require('fs');

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
  process.env.DATABASE_URL = "postgres://shane:rattlers@localhost/taskserver-test";
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

var models = require('./models.js');

// Routes
//app.get(/^\/(index)?$/, function(req, res) {
//	var index = require("./actions/index.js");
//	index.route(req, res);
//});

app.get(/cache.manifest/, function(req, res) {
	console.log("Cache access");
	res.header('Content-Type', 'text/cache-manifest');
	fs.readFile('cache.manifest', function (err, data) {
	  if (err) throw err;
		res.send(data);
	});
});

app.post('/login', function(req, res) {
	var email = req.body.email;
	console.log("Logging in: " + email);
		models.User.findOne({ 'email.ilike': email
												}, function(err, result) {
			var response = {};
			if (err) {
				response.error = "Failed to find this user:" + err.message;
				console.log(response.error);
			}
			// Want to encourage people to enter a name always
			else if (!result || !result.name || !result.registered) {
				// register this bad-ass
				console.log("Redirect to the registration screen");
				response.error = 'Finish the registration by entering your name';
				req.session.email = email;
				response.user = result;
				response.redirect = '/index.html#registerUserPage';
			}
			else {
				req.session.user = result;
				req.session.key = Math.random();
				response.user = req.session.user;
				response.key = req.session.key;
				res.send(JSON.stringify(response));
			}
		});
});

// Get list of chore types
app.get('/chores/types', function(req, res) {
	// Read in all the current chore types
	console.log("request choreTypes");
	models.ChoreType.find( {}, { only: ['name'], order: ['name'] }, function(err, types) {
		console.log("Error: " + err);
		console.log("Got chore type request, sending results: " + JSON.stringify(types));
		res.send(JSON.stringify(types));
	});
});

app.get('/friends/list', function(req, res) {
	// Read in all the friends for leaderboard stuff
	models.Friend.find( {user_id: req.session.user.id}, 
		{include: { user: {},	friend: {} } }, 
		function(err, friendResults) {
			console.log("Error: " + err);
			console.log("Dumping friends: " + JSON.stringify(friendResults));
			res.send(JSON.stringify(friendResults));
		});
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


