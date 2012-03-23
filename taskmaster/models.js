var FastLegS = require('FastLegS');
var _ = require('underscore')._;
var pg = require('pg'); 
var sanitize = require('validator').sanitize;

console.log('DATABASE_URL = ' + process.env.DATABASE_URL);

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "postgres://shane:rattlers@localhost/taskserver-test";
}

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
console.log('PG connection params: ' + JSON.stringify(connectionParams));


var client = new pg.Client(process.env.DATABASE_URL);
client.connect();

var BaseModel = {

	formatValue: function(value) {
		if (_(value).isDate()) {
			return "'" + value.getFullYear()
			+ '/' + (value.getMonth()+1)
			+ '/' + (value.getDate())
			+ ' ' + (value.getHours())
			+ ':' + (value.getMinutes())
			+ ':' + (value.getSeconds()) + "'";
		}
		else if (_(value).isString()) {
			return  "'" + value +  "'";
		}
		return value;
	},

	createWhereClause: function(clauseObject) {
		var where = '',
				clause = '',
				type = '',
				value = '',
				self = this;

		_(clauseObject).chain().keys().each(function(key) {
			value = clauseObject[key];
			if (-1 == key.indexOf('.')) {
				where = ' ' + key + '=';
				where += self.formatValue(value);
			}
			else {
				type = key.split('.')[1];
				where = key.split('.')[0] + ' ' + key.split('.')[1] + ' ';
				where += self.formatValue(value);
			}

			// Add to the current where clause
			if (clause === '') {
				clause = ' WHERE ' + where;
			}
			else {
				clause += ' AND ' + where;
			}
		});
		return clause;
	},

	find: function(clauseObj, filters, resultFn) {
		var clause = this.createWhereClause(clauseObj),
				columns = ' * ',
				query = '',
				orderby = '',
				order = '';

		if (typeof filters === 'function') {
			resultFn = filters;
		}
		else {
			// Add filters to SQL
			if (filters.only) {
				columns = filters.only.toString();
			}
			if (filters.order) {
				_(filters.order).chain().each(function(key) {
					if (-1 == key.indexOf('.')) {
						order = key;
					}
					else {
						order = key.split('.')[0] + ' ' + key.split('.')[1];
					}

					// Add to the current where clause
					if (orderby === '') {
						orderby = ' ORDER BY ' + order;
					}
					else {
						orderby += ', ' + order;
					}
				});
			}
		}

		query = 'SELECT ' + columns + ' from ' + this.tableName + clause + orderby;
		this.executeQuery(query, filters, resultFn);
	},

	executeQuery: function(query, filters, resultFn) {
		console.log('SQL: %s', query);
		client.query(query, function(err, result) {
			// return results
			if (err) {
				console.log('RESULT---> ' + JSON.stringify(result));
				resultFn(err);
			}
			else {
				if (filters.single) {
					result = result.rows[0];
				}
				resultFn(err, result);
			}
		});
	},

	create: function(obj, resultFn) {
		var query = 'INSERT into ' + this.tableName,
				columns = '',
				values = '',
				self = this;

		_(obj).chain().keys().each(function(key) {
				if (columns === '') {
					columns = ' (';
				}
				else {
					columns += ', ';
				}
				columns += key;

				if (values === '') {
					values += ' VALUES (';
				}
				else {
					values += ', ';
				}
				values += self.formatValue(obj[key]);
		});
		query += columns + ') ' + values + ')  RETURNING id';
		this.executeQuery(query, {}, resultFn);
	},

	delete: function(obj, resultFn) {
		var query = 'DELETE FROM ' + this.tableName + this.createWhereClause(obj)
		this.executeQuery(query, {}, resultFn);
	}

};

var User = {
	tableName: 'users',
	primaryKey: 'id'
};
_.extend(User, BaseModel);


var Friend = {
	tableName: 'friends',
	primaryKey: 'id',

	getFriends: function(userID, resultFn) {
		var query = 'select friends.*, users.name, users.points, users.email from users,friends where friends.user_id= ' + sanitize(userID).toInt() + ' and users.id = friends.friend_user_id';
		this.executeQuery(query, {}, resultFn);
	}
};
_.extend(Friend, BaseModel);

var ChoreType = {
	tableName: 'chore_types',
	primaryKey: 'id'
};
_.extend(ChoreType, BaseModel);

var Chore = {
	tableName: 'chores',
	primaryKey: 'id'
};
_.extend(Chore, BaseModel);

//console.log('command line args; ' + JSON.stringify(process.argv));
//User.find({}, {only: ['email', 'name'], order: ['points', 'name']}, function(err, res) {console.log('got: ' + err + ':' + JSON.stringify(res));});
//ChoreType.create({name: 'boooo', created_at: new Date()}, function(err, res) {console.log('got: ' + err + ':' + JSON.stringify(res));});

exports.User = User;
exports.Friend = Friend;
exports.ChoreType = ChoreType;
exports.Chore = Chore;



/*
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

User.find({id:1}, function(err, res) {console.log('got: ' + err + ':' + res);});
*/

/*	findOne: function(clauseObject, resultFn) {
		// if we want the linked tables as well, create intermediate resultFn
		if (this.one) {
			var joins = this.one;
			var newResultFn = function(err, res) {
				if (err || !res.rowCount) {
					console.log('A: Empty result set: ' + JSON.stringify(res));
					resultFn(err, res);
				}
				else {
					console.log('A: ' + JSON.stringify(res));
					// search for the dependent relations
					joins[0].model.findOne({id: res.rows[0][joins[0].joinOn]}, function(err2, res2) {
						console.log('B: ' + JSON.stringify(res2));
						if (err2 || !res.rowCount) {
							console.log('B: Empty result set');
						}
						else {
							res.rows[0][joins[0].name] = res2.rows[0];
							resultFn(err2, res);
						}
					});
				}
			}
			this.findInternal(this.tableName, clauseObject, newResultFn);
		}
		else {
			this.findInternal(this.tableName, clauseObject, resultFn);
		}
	},
*/
