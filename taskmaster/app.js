/**
 * Module dependencies.
 */
var express = require('express');
var fs = require('fs');
var url = require('url');
var _ = require('underscore');
var crypto = require('crypto');

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


function trace(err) {
	var vDebug = ""; 
	for (var prop in err) 
	{  
		vDebug += "property: "+ prop+ " value: ["+ err[prop]+ "]\n"; 
	} 
	vDebug += "toString(): " + " value: [" + err.toString() + "]"; 
	console.log(vDebug); 
}

// Verify the signature
function verifySignature(signature, pathname, params, req, res) {
	try {
		var now = new Date();
		var requestAge = now.getTime() - params.timestamp;

		// Ensure we have access to the user
		if (!req.session.user) {
			console.log('User is not logged in!');
			res.send({error: 'User is not logged in!'});
			return false;
		}
		// Check against replay attacks first
		else if (requestAge > 5000) {
			console.log(pathname + ': API request is too old');
			res.send({error: 'API request is too old: ' + requestAge});
			return false;
		}
		else {
			// reconstruct hash to see if valid
			// Need to hash the (url-path + parameters) in key-sorted order
			var hashparam = pathname + "?";
			_.each(_.keys(params).sort(), function (key) {hashparam += key + "=" + params[key] + "&"; });
			var serverSig = crypto.createHmac('SHA256', req.session.user.secretkey).update(hashparam).digest('hex');

			if (serverSig != signature) {
				console.log(pathname + ': Signature is incorrect: ' + JSON.stringify(hashparam) + ' - ' + serverSig + ' != ' + signature);
				res.send({error: 'Signature is incorrect'});
				return false;
			}
			else {
				console.log(pathname + ': Signature is valid');
			}
		}
	} catch (e) {
		trace(e);
		console.log(pathname + ': Invalid Signature: ' + e + ' : ' + JSON.stringify(signature) + ' - ' + JSON.stringify(params));
		res.send({error: 'Invalid Signature, generate by: hmac_sha256(url_path + key-sorted(parameters + timestamp))'});
		return false;
	}
	return true;
}


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
	models.User.find({ 'email.ilike': email
											}, {single:true}, function(err, user) {
		var response = {};
		if (err) {
			response.error = "Failed to find this user:" + err.message;
			console.log(response.error);
		}
		// Want to encourage people to enter a name always
		else if (!user || !user.name || !user.registered) {
			// register this bad-ass
			console.log("Redirect to the registration screen:" + JSON.stringify(user));
			response.error = 'Finish the registration by entering your name';
			req.session.email = email;
			response.user = user;
		}
		else {
			req.session.user = user;
			req.session.key = user.privatekey;
			response.user = req.session.user;
			response.privatekey = req.session.key;
		}
		console.log('Logged in: sending - ' + JSON.stringify(response));
		res.send(JSON.stringify(response));
	});
});

// Get list of chore types
app.get('/chores/types', function(req, res) {
	try {
		var request = url.parse(req.url, true);
		var params = JSON.parse(request.query.param);
		if (verifySignature(request.query.signature, request.pathname, params, req,  res)) {
			// Read in all the current chore types
			console.log("request choreTypes");

			models.ChoreType.find( {}, { only: ['name'], order: ['name'] }, function(err, types) {
				if (err) console.log("Error: " + err);
				console.log("Got chore type request, sending results: " + JSON.stringify(types));
				console.log('Chore Types: sending - ' + JSON.stringify(types.rows));
				res.send(JSON.stringify(types.rows));
			});
		}
	} catch (e) {
		res.json({success: false, error: e.toString()});
	}
});

app.get('/friends/list', function(req, res) {
	try {
		var request = url.parse(req.url, true);
		var params = JSON.parse(request.query.param);
		if (verifySignature(request.query.signature, request.pathname, params, req, res)) {
			// Read in all the friends for leaderboard stuff
			var params = url.parse(req.url, true).query;
			console.log("request friend list");
			models.Friend.getFriends(req.session.user.id, 
				function(err, friendResults) {
					if (err) console.log("Error: " + err);
					console.log("Dumping friends: " + JSON.stringify(friendResults.rows));
					res.send(JSON.stringify(friendResults.rows));
				}
			);
		}
	} catch (e) {
		res.json({success: false, error: e.toString()});
	}
});

app.get('/logout', function(req, res) {
	req.session.user = undefined;
	res.send({success: true});
});

app.post('/chores/do', function(req, res) {
	try {
		var chores = require("./actions/chores.js");
		var request = url.parse(req.url, true);
		var signature = req.body.signature;
		var params = JSON.parse(req.body.param);
		console.log('/chores/do: ' + JSON.stringify(req.body));
		if (verifySignature(signature, request.pathname, params, req, res)) {
			params.user = req.session.user;
			chores.postChore(params, res);
		}
	} catch (e) {
		res.json({success: false, error: e.toString()});
	}
});

app.get('/chores/get', function(req, res) {
	try {
		var chores = require("./actions/chores.js");
		var request = url.parse(req.url, true);
		var params = JSON.parse(request.query.param);
		var signature = request.query.signature;
		console.log('/chores/get: ' + JSON.stringify(req.body));
		if (verifySignature(signature, request.pathname, params, req, res)) {
			params.user = req.session.user;
			chores.getChores(params, res);
		}
	} catch (e) {
		res.json({success: false, error: e.toString()});
	}
});

app.get('/user/getUserPoints/:id', function(req, res) {
	try {
		console.log('/user/getUserPoints: ' + JSON.stringify(req.body));
		var chores = require("./actions/chores.js");
		var request = url.parse(req.url, true);
		var params = JSON.parse(request.query.param);
		var signature = request.query.signature;
		if (verifySignature(signature, request.pathname, params, req, res)) {
			params.user = req.session.user;
			chores.getUserPoints(req.params.id, res);
		}
	} catch (e) {
		trace(e);
		res.json({success: false, error: e.toString()});
	}
});




/*

app.get('/register_user', function(req, res) {
	var index = require("./actions/register.js");
	index.route(req, res, false); // isPost = false
});

app.post('/register_user', function(req, res) {
	var index = require("./actions/register.js");
	index.route(req, res, true); // isPost = true
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

*/


// So that 'require' for tests doesn't auto start the server
if (!module.parent) {
	// port is provided by heroku if running through that.
	var port = process.env.PORT || 3000;
	app.listen(port);
	console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
}


