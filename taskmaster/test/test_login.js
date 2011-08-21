process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgres://shane:rattlers@localhost/taskserver-test';
process.env.PGPASSWORD = 'rattlers';

var app = require('../app');
var models = require('models');
var exec = require('child_process').exec;
var assert = require('assert');
var soda = require('soda');
var testCase = require('nodeunit').testCase;

var fixtureRan = false;
var browser = soda.createClient( {
	host: 'localhost',
	port: 4444,
	url: 'http://localhost:3001',
	browser: 'googlechrome'
});

exports.group = testCase({
	
	setUp: function(done) {
		// Only want to start the server once for the group of tests
		if (!fixtureRan) {
			var tables = [ models.User, models.ChoreType, models.Chore, models.Friend ];
			// Load up the schema
			exec('psql taskserver-test < db/schema.sql', function(error, stderr, stdout) {
				console.log("Starting up server...");
				fixtureRan = true;

				app.listen(3001);
				console.log("....started!");
				browser
					.chain
					.session()
				  .open('/')
					.end(function(err) {
						console.log("browser end()");
						assert.ok(!err, 'Got error starting up chrome: ' + err);
						done();
					});
			});
		}
		else {
			done();
		}
	},

	tearDown: function(done) {
		done();
	},

  'test login': function(test) {
		test.expect(1);
		browser
			.chain
			.open('/')
			.type('email', 'henders@gmail.com')
      .clickAndWait('submit')
			.end(function (err) {
				test.ok(!err, 'Failed opening login screen: ' + err);
				test.done();
			});
  },

  'test register': function(test) {
		test.expect(1);

		browser
			.chain
			.open('/register_user')
			.end(function (err) {
				test.ok(!err, 'Failed opening login screen: ' + err);
				test.done();
			});
			/*
			test.ok($("input[name=email]").length);
			test.ok($("input[name=name]").length);
			// Fill email and submit form
			$('form').fill("input[name=email]", "henders@gmail.com");
			$('form').fill("input[name=name]", "Shane Hender");
			$("input[type=submit]").click(function(res2, $2) {
				// Form submitted, new page loaded.
				// Verify we were redirected to the index page
				test.equals(200, res2.statusCode);
			});
			*/
	},

	'test end': function(test) {
		browser
			.chain
			.testComplete()
			.end(function(err) {
				app.close();
				test.done();
			});
	}
});


