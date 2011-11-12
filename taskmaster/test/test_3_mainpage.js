var util = require('util');
var helper = require('./helper');
var models = require('models');
var assert = require('assert');


module.exports = {

	setup: function(done) {
		var doNotClearDB = true;
		helper.startup(done, doNotClearDB);
	},

  'test loadIndexPage': function login(done) {
		helper.browser
			.chain
			.open('/logout')
			.type('email', 'henders@gmail.com')
      .clickAndWait('submit')
			.assertLocation(helper.rootUrl + "/index")
			.assertElementPresent('id=choreName')
			.assertElementPresent('id=personName')
			.assertElementPresent('id=time')
			.assertValue('id=timeLabel', '30m')
			.waitForElementPresent('css=div#leaderboardDiv canvas')
			.assertText('css=div.tickLabels div.tickLabel:first-child', 'regex:^0(\\.0)?$')
			.end(function (err, body, res) {
				assert.ok(!err, 'Failed loadIndexPage test: ' + err);
				done();
			});
  },

  'test leaderboardForUserHenders': function login(done) {
		helper.browser
			.chain
			.open('/logout')
			.type('email', 'henders@gmail.com')
      .clickAndWait('submit')
			.waitForElementPresent('css=div#leaderboardDiv canvas')
			// With other friends test run, there should be 3 people in the leaderboard graph
			.assertElementPresent('css=div.legend tr:nth-child(3)')
			.assertElementNotPresent('css=div.legend tr:nth-child(4)')
			.assertText('css=div.tickLabels div.tickLabel:first-child', 'regex:^0(\\.0)?$')
			//.getText('css=div.legend tr:nth-child(3)')
			.end(function (err, body, res) {
				//util.debug("RESULT: " + err + " - " + body + " - " + res);
				assert.ok(!err, 'Failed leaderboardForUserHenders test: ' + err);
				done();
			});
  },

  'test leaderboardForUserHenders.spam1': function login(done) {
		helper.browser
			.chain
			.open('/logout')
			.type('email', 'henders.spam1@gmail.com')
      .clickAndWait('submit')
			.waitForElementPresent('css=div#leaderboardDiv canvas')
			// With other friends test run, there should be 2 people in the leaderboard graph
			.assertElementPresent('css=div.legend tr:nth-child(2)')
			.assertElementNotPresent('css=div.legend tr:nth-child(3)')
			.assertText('css=div.tickLabels div.tickLabel:first-child', 'regex:^0(\\.0)?$')
			.end(function (err, body, res) {
				assert.ok(!err, 'Failed leaderboardForUserHenders.spam1 test: ' + err);
				done();
			});
  },

  'test submitChore': function login(done) {
		helper.browser
			.chain
//			.setSpeed(1000)
			.open('/logout')
			.type('email', 'henders@gmail.com')
      .clickAndWait('submit')
			.waitForPageToLoad(2000)
			.type('id=choreName', 'Wash Dishes')
			// click on the time slider anywhere always puts it at the lowest value *sigh*
			.clickAt('id=time', '')
			.assertValue('id=time', 10)
			.assertValue('id=timeLabel', '10m')
      .clickAndWait('id=choreSubmit')
			.assertLocation(helper.rootUrl + '/do_chore')
			// Ensure there are no flash messsages
			.assertElementNotPresent('css=div#messages *:first-child')
			.assertText('css=table#chores', 'regex:Wash Dishes 10')
			.end(function (err, body, res) {
				assert.ok(!err, 'Failed submitChore test: ' + err);
				done();
			});
  },

  'test submitDropDownChore': function login(done) {
		helper.browser
			.chain
			.setSpeed(1000)
			.open('/logout')
			.type('email', 'henders@gmail.com')
      .clickAndWait('submit')
			.focus('id=choreName')
//			.mouseDown('id=choreName')
//			.typeKeys('id=choreName', 'Dish')
			.type('id=choreName', 'Dish')

			.waitForCondition("window.myevt = $.Event('keydown.autocomplete'); window.myevt.keyCode = $.ui.keyCode.DOWN; $('#choreName').trigger(evt);", 2000)

			// Wait for the autocomplete dropdown to appear
			.waitForElementPresent('css=.ui-autocomplete li', 2000)
			.assertText('css=.ui-autocomplete li', 'Wash Dishes')
			.click('css=.ui-autocomplete li')
      .clickAndWait('id=choreSubmit')
			.assertLocation(helper.rootUrl + '/do_chore')
			// Ensure there are no flash messsages
			.assertElementNotPresent('css=div#messages *:first-child')
			.assertText('css=table#chores', 'regex:Wash Dishes 30')
			.end(function (err, body, res) {
				assert.ok(!err, 'Failed submitDropDownChore test: ' + err);
				done();
			});
  },

	'test end': function (done) {
		helper.shutdown(done);
	}
};

