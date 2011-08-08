var models = require("../models");

var doStuff = {

	doGet: function () {
		console.log("Rendering the normal login screen");
		this.res.render('login', {
			title: "Shane's Task Server",
			register: false
		});
	},

	doPost: function() {
		if (this.isRegistering) {
			this.registerUser();
		}
		else {
			this.login();
		}
	},
	
	login: function() {
		var email = this.req.body.email;
		var that = this;

		console.log("Logging in: " + email);
		models.User.findOne({ 'email.like': email
												}, function(err, result) {
			if (err) {
				console.log("Failed to find this user:" + err.message);
			}
			else if (!result || !result.id) {
				// register this bad-ass
				console.log("Redirect to the registration screen");
				that.res.render('login', {
					title: "Shane's Task Server",
					register: true
				});
			}
			else {
				console.log("Found " + result + " users");
				that.req.session.user = result;
				that.res.render('index', {
					title: "Shane's Task Server",
					user: result
				});
			}
		});
	},

	registerUser: function() {
		var email = this.req.body.email;
		var name = this.req.body.name;
		var that = this;

		// Load default user
		console.log("Registering User:: " + name + " - " + email);
		models.User.create( { name: name, email: email}, function(err, result) {
			if (err || !result || !result.rowCount) {
				console.log("Error: Failed to create the new user");
				that.res.render('login', {
					title: "Shane's Task Server",
					register: true
				});
			}
			else {
				that.req.session.user = result;
				that.res.render('index', {
					title: "Shane's Task Server",
					user: result
				});
			}
		});
	},

	route: function(isGet) {
		if (isGet) {
			this.doGet();
		}
		else {
			this.doPost();
		}
	}
};

exports.route = function(req, res, isGet, isRegistering) {
	doStuff.req = req;
	doStuff.res = res;
	doStuff.isRegistering = isRegistering;

	doStuff.route(isGet);
};
