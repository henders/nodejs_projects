process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgres://shane:rattlers@localhost/taskserver-test';
process.env.PGPASSWORD = 'rattlers';

var app = require('../app');
var exec = require('child_process').exec;
var soda = require('soda');
var assert = require('assert');
var log = require('util');
var _ = require('underscore');
_.mixin(require('underscore.string'));

var fixtureRan = false;


// Override the console.log() to keep output minimal
console.log = function (argument) {
	// print nothing during tests
};

exports.rootUrl = "http://localhost:3001";
exports.browser = soda.createClient( {
	host: 'localhost',
	port: 4444,
	url: this.rootUrl,
	browser: 'googlechrome'
});

exports.startup = function (done, doNotClearDB) {
	// Only want to start the server once for the group of tests
	if (!fixtureRan) {
		exports.browser.on('command', function(cmd, args){
		  log.log( _.sprintf(' \x1b[33m%s\x1b[0m: %s', cmd, args.join(', ')));
		});
		process.on('exit', function () {
			//log.debug("Shutdown from exit signal");
			// When tests fail ensure we quit processes
			exports.shutdown();
		});
		process.on('uncaughtException', function () {
			//log.debug("Shutdown from uncaughtException signal");
			// When tests fail ensure we quit processes
			exports.shutdown();
		});

		// Load up the schema
		if (!doNotClearDB) {
			exec('psql taskserver-test < db/schema.sql', function(error1, stderr, stdout) {
				assert.ok(!error1, "Failed to import schema");

				app.listen(3001);
				exports.browser
					.chain
					.session()
					.open('/')
					.end(function(err) {
						assert.ok(!err, 'Got error starting up chrome: ' + err);
						fixtureRan = true;
						done();
					});
			});
		}
		else
		{
			log.debug("Skipping the DB import")
			app.listen(3001);
			exports.browser
			.chain
			.session()
			.open('/')
			.end(function(err) {
				assert.ok(!err, 'Got error starting up chrome: ' + err);
				fixtureRan = true;
				done();
			});
		}
	}
	else {
		done();
	}
};


// Ensure we shutdown correctly
exports.shutdown = function(done) {
	if (fixtureRan) {
		exports.browser
		.chain
		.testComplete()
		.end(function(err) {
			//log.debug("Shutting down......");
			app.close();
			process.exit(0);
			done();
		});
	}
	else {
		done();
	}
};

