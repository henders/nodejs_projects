var models = require('./models');

function test_createNewChore() {
	var chores = require("./actions/chores.js"),
			choreId = 0;
	
	var params = { user: 1, choreType: 'fake stuff', time: 43};
	try {
		chores.postChore(params, { send: function(){}, json: function() {
			models.ChoreType.delete({'name.like': 'fake stuff'}, function(err, res) { if (err) console.log('failed to delete choretype' + err); } );
			models.Chore.delete({id: choreId}, function(err, res) { if (err) console.log('failed to delete chore' + err); } );
		} });
	}
	catch (ex) {
	}
}

function test_getChores() {
}

test_createNewChore();
test_getChores();
