var models = require("../models");
var _ = require('underscore')._;
var date = require('datetime');


var postChore = function(params, res) {
	var choreName = params.choreType;

	// Check if the chore type exists
	models.ChoreType.find({'name.like': choreName}, function(err, result) {
		if (err || !result.length) {
			// Doesn't exist so create it!
			models.ChoreType.create({name: choreName, 
				created_at: new Date()
			}, function(err2, result2) {
				if (err2 || !result2.rowCount) {
					var apiResponse = {};
					apiResponse.success = false;
					apiResponse.error = "Failed to create the chore type: " + choreName + ": " + JSON.stringify(err2);
					console.log(apiResponse.error);
					res.send(apiResponse);
				}
				else {
					console.log("Created new chore type: " + choreName);
					params.choreTypeDB = result2.rows[0];
					createChore(params, res);
				}
			});
		}
		else {
			console.log("Found chore type: " + result[0].id);
			params.choreTypeDB = result[0];
			createChore(params, res);
		}
	});
};

var createChore = function(params, res) {
	// We should now have the choretype and person (through session) info
	models.Chore.create( {type: params.choreTypeDB.id,
		person: params.user.id,
		done_date: new Date(),
		created_at: new Date(),
		time_taken: params.time
	}, function(err, chore) {
		var apiResponse = {};
		if (err || !chore) {
			apiResponse.success = false;
			apiResponse.error = "Failed to create the chore: " + JSON.stringify(err);
			console.log(apiResponse.error);
			res.json(apiResponse);
		}
		else {
			apiResponse.success = true;
			res.json(apiResponse);
		}
	});
};

var getChores = function(params, res) {
	var choreData = [];
	var chorePieData = [];
	var dateDone;

	var apiResponse = {};

	// Read all the current chores
	models.Chore.find({person: params.user.id}, { 
		include: {
			type: {},
			person: {}
		},
		order: ['-done_date']
	}, function(err, chores) {
		if (err) {
			apiResponse.success = false;
			apiResponse.error = "Failed to get the chores: " + JSON.stringify(err);
			res.json(apiResponse);
		}
		else {
			console.log("Chores: " + JSON.stringify(chores));

			// refactor chores data for pie chart display
			for (var i = 0; i < chores.length; i++) {
				choreData[chores[i].type.name] = choreData[chores[i].type.name] ? 
				choreData[chores[i].type.name] + 1 : 1;

				// change the date/time display of chores
				dateDone = new Date(chores[i].done_date);
				chores[i].done_date = date.format(dateDone, '%b %d %H:%M');
				chores[i].points = chores[i].time_taken;
			}
			_.each(_.keys(choreData), function(key) {
				chorePieData[chorePieData.length] = {label: key, data: choreData[key] };
			});
			apiResponse.chorePieData = chorePieData;
			apiResponse.chores = chores;
			res.json(apiResponse);
			console.log("ChorePieData: " + JSON.stringify(chorePieData));
		}
	});
};

var getUserPoints = function(id, res) {
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
			res.json(returnObject);
		});
	});
};

exports.postChore = postChore;
exports.createChore = createChore;
exports.getChores = getChores;
exports.getUserPoints = getUserPoints;

