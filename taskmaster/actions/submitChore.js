var models = require("../models");


var doStuff = {
	req: null,
	res: null,
	choreType: null,

	postChore: function() {
		var that = this;
		var choreName = this.req.body.chore;

		// Check if the chore type exists
		models.ChoreType.find({'name.like': choreName}, function(err, result) {
			if (err || 0 == result.length) {
				// Doesn't exist so create it!
				models.ChoreType.create({name: choreName, 
																 created_at: new Date()
																}, function(err2, result2) {
					if (err2 || 0 == result2.rowCount) {
						console.log("Failed to create the chore type: " + choreName + ": " + JSON.stringify(err2));
						that.renderChores(err2.message || "Empty result set");
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
														done_date: new Date() ,
														created_at: new Date() 
													 }, function(err, result) {
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

		var render = function(err, chores) {
			console.log("Chores: " + JSON.stringify(chores));
			// change the date/time display of chores
			for (var i = 0; i < chores.length; i++) {
				var dateDone = new Date(chores[i].done_date);
				chores[i].done_date = dateDone.getFullYear() + "/" + dateDone.getMonth() + "/" +
													dateDone.getDate() + " " + dateDone.toLocaleTimeString();
			};

			that.res.render('show', {
				title: "Task Server: Chore List",
				flash: that.req.flash(),
				user: that.req.session.user,
				chores: chores,
				error: msg || err
			});
		};

		// Read all the current chores
		models.Chore.find({person: that.req.session.user.id}, { 
			include: {
				type: {},
				person: {}
			},
			limit: 4,
			order: ['-id']
		}, render);
	}
}

exports.route = function(req, res, action) {
	doStuff.req = req;
	doStuff.res = res;

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

			default:
				req.flash('error', 'Unknown friend action (%s)', action);
				res.redirect('/');
		}
	}
};
