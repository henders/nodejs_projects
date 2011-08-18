var models = require("../models");

var router = function(spec) {
	var newRouter = {};

	newRouter.req = spec.req;
	newRouter.res = spec.res;

	newRouter.registerUser = function() {
		var email = this.req.body.email;
		var name = this.req.body.name;
		var that = this;
		var resultRow;
	
		var processResult = function(err) {
			if (err || !resultRow || !resultRow.id) {
				console.log("Error: Failed to create the new user: " + 
					JSON.stringify(err) + " - result: " + JSON.stringify(resultRow));
				that.req.flash('error', "Error: Failed to create the new user");
				err && that.req.flash('error', err);
				that.res.render('register', {
					title: "Shane's Task Server",
					flash: that.req.flash()
				});
			}
			else {
				that.req.flash('info', 'Thanks for registering, you awesome task-master you!');
				that.req.session.user = resultRow;
				that.res.redirect('/index');
			}
		};

		// Load default user
		console.log("Registering User:: " + name + " - " + email);
		models.User.findOne( {'email.like': email}, function(err, findResult) {
			err && that.req.flash('error', err);
			if (findResult && findResult.id && findResult.registered) {
				that.req.flash('info', 'Ooops, that email appears to have already been registered, do you have an evil twin?');
				that.res.redirect('/login');
			}
			else if (findResult && findResult.id) {
				models.User.update( {id: findResult.id}, { 
															name: name, 
															registered: true
														}, function(err, update) {
					resultRow = update ? findResult : undefined;
					processResult(err);
				});
			}
			else {
				models.User.create( { name: name, 
															email: email,
															created_at: new Date(),
															registered: true
														}, function(err, createResult) {
					if (createResult && createResult.rows) { 
						resultRow = createResult.rows[0];
					}
					processResult(err);
				});
			}
		});
	};

	newRouter.route = function(isPost) {
		if (!isPost) {
			// register this bad-ass
			this.res.render('register', {
				title: "Shane's Task Server",
				email: this.req.session.email || '',
				flash: this.req.flash()
			});
		}
		else {
			this.registerUser();
		}
	};
	
	return newRouter;
};

exports.route = function(req, res, isPost) {
	var doStuff = router({req:req, res:res});
	doStuff.route(isPost);
};

