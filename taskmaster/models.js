var FastLegS = require('FastLegS');

// Need to put the connection here as the FastLegS var needs to be initialized before creating classes
var dbParseString = /^postgres:\/\/(\w+):(\w+)@([A-Za-z0-9-_\.]+)\/([A-Za-z0-9-_\.]+)$/
var herokuDbParams = dbParseString.exec(process.env.DATABASE_URL) || [];
var connectionParams = {
						user: herokuDbParams[1] || 'shane'
						, password: herokuDbParams[2] || 'rattlers'
						, host: herokuDbParams[3] || 'localhost'
						, database: herokuDbParams[4] || 'taskserver'
						, port: 5432
}
FastLegS.connect(connectionParams);


var User = FastLegS.Base.extend({
	tableName: 'users',
	primaryKey: 'id'
});

var Friend = FastLegS.Base.extend({
	tableName: 'friends',
	primaryKey: 'id',
	one: [ {user: User, joinOn: 'user_id'},
					{friend: User, joinOn: 'friend_user_id'} ]
});

var ChoreType = FastLegS.Base.extend({
	tableName: 'chore_types',
	primaryKey: 'id'});

var Chore = FastLegS.Base.extend({
	tableName: 'chores',
	primaryKey: 'id',
	one: [ { type: ChoreType, joinOn: 'type'},
					{ person: User, joinOn: 'person'}
	]});

exports.User = User;
exports.Friend = Friend;
exports.ChoreType = ChoreType;
exports.Chore = Chore;
