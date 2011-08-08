var models = require("./models");

var doStuff = {
	route: function() {
		if (!req.session.user) {
			// User isn't signed in yet, so redirect to login screen
			this.res.render('login', {
					title: "Shane's Task Server",
			});
		}
		else {
			console.log("Found " + result + " users");
			this.req.session.user = result;
			this.res.render('index', {
				title: "Shane's Task Server",
				user: result
			});
		}
	}
};

exports.route = function(req, res) {
	doStuff.req = req;
	doStuff.res = res;
	doStuff.route();
};
