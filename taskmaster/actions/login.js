var models = require("models");

var router = function(spec) {
	var newRouter = {};

	newRouter.req = spec.req;
	newRouter.res = spec.res;

	newRouter.login = function() {
		var email = this.req.body.email;
		var that = this;

		console.log("Logging in: " + email);
		models.User.findOne({ 'email.ilike': email
												}, function(err, result) {
			if (err) {
				console.log("Failed to find this user:" + err.message);
				that.req.flash('error', JSON.stringify(err));
				that.res.redirect('/');
			}
			// Want to encourage people to enter a name always
			else if (!result || !result.name || !result.registered) {
				// register this bad-ass
				console.log("Redirect to the registration screen");
				that.req.flash('info', 'Finish the registration by entering your name');
				that.req.session.email = email;
				that.res.redirect('/register_user', 301);
			}
			else {
				that.req.session.user = result;
				that.res.redirect('/index');
			}
		});
	};

	newRouter.route = function(isGet) {
		if (isGet) {
			console.log("Rendering the normal login screen");
			this.res.render('login', {
				title: "Shane's Task Server",
				flash: this.req.flash()
			});
		}
		else {
			this.login();
		}
	};
	
	return newRouter;
};

exports.route = function(req, res, isGet) {
	var doStuff = router({req:req, res:res});
	doStuff.route(isGet);
};
