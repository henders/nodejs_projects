var models = require("../models");
var _ = require('underscore')._;

var doStuff = {
	route: function() {
		var that = this;
		var types = [];
		var friends = [];

		if (!this.req.session.user) {
			// User isn't signed in yet, so redirect to login screen
			this.res.redirect('/login');
		}
		else {
			console.log("Current user: " + JSON.stringify(this.req.session.user));
			// Read in all the current chore types
			models.ChoreType.find( {}, { only: ['name'], order: ['name'] }, function(err, types) {
				for (var i = 0; i < types.length; i++) {
					types[i] = types[i].name;
				};

				// Read in all the chores the user has done in last 30days for pie chart
				models.Chore.find({person: that.req.session.user.id},
													{include: {'type':{} }}, 
													function(err, chores) {
						var choreData = [];
						var chorePieData = [];

						// refactor chores data for pie chart display
						for (var i = 0; i < chores.length; i++) {
							choreData[chores[i].type.name] = choreData[chores[i].type.name] ? 
																									choreData[chores[i].type.name] + 1 : 1;
						};
						_.each(_.keys(choreData), function(key) {
							chorePieData[chorePieData.length] = {label: key, data: choreData[key] };
						});
						console.log("ChorePieData: " + JSON.stringify(chorePieData));

						// Read in all the friends for leaderboard stuff
						models.Friend.find( {}, { include: { user: {},	friend: {} } }, function(err, friends) {
							for (var i = 0; i < friends.length; i++) {
								friends[i] = friends[i].name;
							};

							// Now render the page damnit!
							that.res.render('index', {
								title: "Shane's Task Server",
								flash: that.req.flash(),
								user: that.req.session.user,
								types: JSON.stringify(types),
								friends: JSON.stringify(friends),
								chores: chores, 
								chorePieData: JSON.stringify(chorePieData)
							});
						});
					});
			});
		}
	}
};

exports.route = function(req, res) {
	doStuff.req = req;
	doStuff.res = res;

	if (!req.session.user) {
		// User isn't signed in yet, so redirect to login screen
		res.redirect('/login');
	}
	else {
		doStuff.route();
	}
};
