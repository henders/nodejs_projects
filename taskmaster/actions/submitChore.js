var models = require("./models");

var doStuff = {
	req: null,
	res: null,
	choreType: null,

	route: function(createFlag) {
		var that = this;
		var choreName = createFlag ? this.req.body.chore : null;

		if (!createFlag) {
			this.renderChores();
		}
		else {
			// Check if the chore type exists
			models.ChoreType.find({'name.like': choreName}, function(err, result) {
				if (err || 0 == result.length) {
					// Doesn't exist so create it!
					models.ChoreType.create({name: choreName}, function(err, result2) {
						if (err || 0 == result2.rowCount) {
							console.log("Failed to create the chore type: " + choreName + ": " + err);
							that.renderChores(err || "Empty result set");
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
		}
	},

	createChore: function() {
		// We should now have the choretype and person (through session) info

		if (!this.req.session.user) {
			that.renderChores("No user set");
		}
		else {
			var that = this;

			models.Chore.create( {type: that.choreType.id,
				person: that.req.session.user.id,
				done_date: new Date() }, function(err, result) {
					if (err || 0 == result.length) {
						that.renderChores(err.message || "Empty result set");
					}
				else {
					that.renderChores("Succesfully created chore: " + that.choreType.name);
				}
			});
		}
	},
	
	renderChores: function(msg) {
		var that = this;

		var render = function(err, result) {
			that.res.render('show', {
				title: "Task Server: Chore List",
				user: that.req.session.user,
				chores: result,
				error: msg || err
			});
		};
		// Read all the current chores
		models.Chore.find({}, { 
			include: {
				type: {},
				person: {}
			},
			limit: 4,
			order: ['-id']
		}, render);
	}
}

exports.route = function(req, res, createFlag) {
	doStuff.req = req;
	doStuff.res = res;
	doStuff.route(createFlag);
};
