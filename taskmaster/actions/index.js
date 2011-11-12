var models = require("../models");

var router = function(spec) {
	var newRouter = {};

	newRouter.req = spec.req;
	newRouter.res = spec.res;

	newRouter.route = function() {
		var that = this;
		var types = [];
		var friends = [];
		var userIds = [];
		var userIdsKeys = [];

		if (!this.req.session.user) {
			// User isn't signed in yet, so redirect to login screen
			this.res.redirect('/login');
		}
		else {
			console.log("Current user: " + JSON.stringify(this.req.session.user));
			userIds.push(that.req.session.user.id);

			// Read in all the current chore types
			models.ChoreType.find( {}, { only: ['name'], order: ['name'] }, function(err, types) {
				for (var i = 0; i < types.length; i++) {
					types[i] = types[i].name;
				}

				// Read in all the friends for leaderboard stuff
				models.Friend.find( {user_id: that.req.session.user.id}, 
														{include: { user: {},	friend: {} } }, 
														function(err, friendResults) {
					console.log("Dumping friends: " + JSON.stringify(friendResults));
					for (var i = 0; i < friendResults.length; i++) {
						friends[i] = friendResults[i].friend.name;
						userIds.push(friendResults[i].friend.id);
					}

					// Now render the page damnit!
					that.res.render('index', {
						title: "Shane's Task Server",
						flash: that.req.flash(),
						user: that.req.session.user,
						types: JSON.stringify(types),
						friends: JSON.stringify(friends),
						userIds: userIds
					});
				});
			});
		}
	};
	
	return newRouter;
};

exports.route = function(req, res) {
	var doStuff = router({req:req, res:res});

	if (!req.session.user) {
		// User isn't signed in yet, so redirect to login screen
		res.redirect('/login');
	}
	else {
		doStuff.route();
	}
};
