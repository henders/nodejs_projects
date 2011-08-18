var models = require("../models");
var _ = require('underscore')._;
var date = require('datetime');


var router = function(spec) {
	var newRouter = {};

	newRouter.req = spec.req;
	newRouter.res = spec.res;
	newRouter.choreType = null;

	newRouter.postChore = function() {
		var that = this;
		var choreName = this.req.body.chore;

		// Check if the chore type exists
		models.ChoreType.find({'name.like': choreName}, function(err, result) {
			if (err || !result.length) {
				// Doesn't exist so create it!
				models.ChoreType.create({name: choreName, 
																 created_at: new Date()
																}, function(err2, result2) {
					if (err2 || !result2.rowCount) {
						console.log("Failed to create the chore type: " + choreName + ": " + JSON.stringify(err2));
						that.req.flash('error', "Failed to create the chore type: " + choreName + ": " + JSON.stringify(err2));
						that.renderChores();
					}
					else {
						console.log("Created new chore type: " + choreName);
						that.choreType = result2.rows[0];
						that.createChore();
					}
				});
			}
			else {
				console.log("Found chore type: " + result[0].id);
				that.choreType = result[0];
				that.createChore();
			}
		});
	};

	newRouter.createChore = function() {
		// We should now have the choretype and person (through session) info

		if (!this.req.session.user) {
			this.req.flash('error', "No user set");
			this.res.redirect('/login');
		}
		else {
			var that = this;

			models.Chore.create( {type: that.choreType.id,
														person: that.req.session.user.id,
														done_date: new Date(),
														created_at: new Date(),
														time_taken: that.req.body.time
													 }, function(err, result) {
				if (err || !result) {
					that.req.flash('error', "Failed to create the chore: " + JSON.stringify(err));
				}
				that.renderChores();
			});
		}
	};
	
	newRouter.renderChores = function() {
		var that = this;

		var render = function(err, chores) {
			var choreData = [];
			var chorePieData = [];
			var dateDone;

			console.log("Chores: " + JSON.stringify(chores));

			// refactor chores data for pie chart display
			for (var i = 0; i < chores.length; i++) {
				choreData[chores[i].type.name] = choreData[chores[i].type.name] ? 
				choreData[chores[i].type.name] + 1 : 1;

				// change the date/time display of chores
				dateDone = new Date(chores[i].done_date);
				chores[i].done_date = date.format(dateDone, '%b %d %H:%I');
				chores[i].points = chores[i].time_taken;
			}
			_.each(_.keys(choreData), function(key) {
				chorePieData[chorePieData.length] = {label: key, data: choreData[key] };
			});
			console.log("ChorePieData: " + JSON.stringify(chorePieData));

			that.res.render('show', {
				title: "Task Server: Chore List",
				flash: that.req.flash(),
				user: that.req.session.user,
				chores: chores,
				chorePieData: JSON.stringify(chorePieData)
			});
		};

		// Read all the current chores
		models.Chore.find({person: that.req.session.user.id}, { 
			include: {
				type: {},
				person: {}
			},
			order: ['-done_date']
		}, render);
	};

	newRouter.getUserPoints = function(id) {
		var that = this;
		var returnObject = { name: '', points: 0 };

		console.log("Finding points for user: " + id);
		models.User.findOne({id: id}, function(err, user) {
			returnObject.id = user.id;	
			returnObject.name = user.name;

			// Read all the current chores for the user
			models.Chore.find({person: id}, { include: { person: {}}}, function(err, chores) {
				// refactor chores data for pie chart display
				for (var i = 0; i < chores.length; i++) {
					returnObject.points += chores[i].time_taken;
				}
				console.log("User Points: " + JSON.stringify(returnObject));
				that.res.json(returnObject);
			});
		});
	};

	return newRouter;
};

exports.route = function(req, res, action) {
	var doStuff = router({req:req, res:res});

	if (!req.session.user) {
		// User isn't signed in yet, so redirect to login screen
		res.redirect('/login');
	}
	else {
		switch(action) {
			case 'get':
				doStuff.renderChores();
				break;
			case 'createChore':
				doStuff.postChore();
				break;
			case 'getUserPoints':
				doStuff.getUserPoints(req.params.id);
				break;
			default:
				req.flash('error', 'Unknown friend action (%s)', action);
				res.redirect('/');
		}
	}
};
