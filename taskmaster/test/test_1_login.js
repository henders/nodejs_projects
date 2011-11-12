var helper = require('./helper');
var models = require('models');
var assert = require('assert');


module.exports = {
	
	setup: function(done) {
		helper.startup(done);
	},

  'test invalid#login': function login(done) {
		helper.browser
			.chain
			.open('/')
			.type('email', 'henders@gmail.com')
      .clickAndWait('submit')
			.assertLocation(helper.rootUrl + "/register_user")
			.end(function (err) {
				assert.ok(!err, 'Failed invalid login test: ' + err);
				done();
			});
  },

  'test register': function register(done) {
		models.User.findOne({ 'email.like': 'henders@gmail.com' }, function(err, result) {
			assert.ok(!err && !result, "User was already in the DB: " + err + " - " + JSON.stringify(result));
			helper.browser
				.chain
				.open('/register_user')
				.type('email', 'henders@gmail.com')
				.type('name', 'Shane')
				.clickAndWait('submit')
				.assertLocation(helper.rootUrl + "/index")
				.end(function (err) {
					assert.ok(!err, 'Failed opening login screen: ' + err);
					models.User.findOne({ 'email.like': 'henders@gmail.com' }, function(err, result) {
						assert.ok(!err && result && result.name === 'Shane', "User wasn't created correctly");
						done();
					});
				});
		});
	},

  'test logout': function login(done) {
		helper.browser
			.chain
			.open('/logout')
			.waitForPageToLoad(3000)
			.assertLocation(helper.rootUrl + "/login")
			.end(function (err) {
				assert.ok(!err, 'Failed logout test: ' + err);
				done();
			});
  },

	'test valid#login': function login(done) {
		helper.browser
			.chain
			.open('/')
			.type('email', 'henders@gmail.com')
      .clickAndWait('submit')
			.assertLocation(helper.rootUrl + "/index")
			.open('/logout') // logout afterwards
			.end(function (err) {
				assert.ok(!err, 'Failed valid login test: ' + err);
				done();
			});
  },

	'test end': function (done) {
		helper.shutdown(done);
	}
};


