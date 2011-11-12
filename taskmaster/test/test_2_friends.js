var util = require('util');
var helper = require('./helper');
var models = require('models');
var assert = require('assert');


module.exports = {

	setup: function(done) {
		var doNotClearDB = true;
		helper.startup(done, doNotClearDB);
	},

  'test loadFriendsPage': function login(done) {
		helper.browser
			.chain
			.open('/')
			.type('email', 'henders@gmail.com')
      .clickAndWait('submit')
			.clickAndWait('id=friends_icon')
			.assertLocation(helper.rootUrl + "/friends")
			.end(function (err) {
				assert.ok(!err, 'Failed invalid login test: ' + err);
				done();
			});
  },

  'test addUnregisteredFriend': function login(done) {
		helper.browser
			.chain
			// log in henders@gmail.com
			.open('/logout')
			.type('email', 'henders@gmail.com')
      .clickAndWait('submit')
			// Goto friends page
			.clickAndWait('id=friends_icon')
			// Add new user as friend
      .click('id=addFriendButton')
			.type('email', 'henders.spam@gmail.com')
			.clickAndWait('id=friendSubmit')
			.assertLocation(helper.rootUrl + "/add_friend")
			// Verify friend appeared as pending
			.assertText('css=div#messages li:first-child', 'Friend request sent!')
			.assertText('css=table#friendPending tr:nth-child(2) td:first-child', 'henders.spam@gmail.com')
			.assertText('css=table#friendPending tr:nth-child(2) td:nth-child(2)', 'pending')
			.end(function (err) {
				assert.ok(!err, 'Failed addUnregisteredFriend: ' + err);
				done();
			});
  },

  'test verifyUnregisteredFriend': function login(done) {
		helper.browser
			.chain
			// register new user and verify friend request is there
			.open('/logout')
			.open('/register_user')
			.assertLocation(helper.rootUrl + "/register_user")
			.type('email', 'henders.spam@gmail.com')
			.type('name', 'Spam')
      .clickAndWait('submit')
			// Goto friend page and approve friend request
			.assertLocation(helper.rootUrl + "/index")
      .click('css=button')
			.clickAndWait('id=friends_icon')
			.assertLocation(helper.rootUrl + "/friends")
			.click('id=friendTabRequests')
			.assertElementPresent('id=approve')
			.clickAndWait('id=approve')
			// log back in henders@gmail.com
			.open('/logout')
			.type('email', 'henders@gmail.com')
      .clickAndWait('submit')
			// Goto friends page and verify new friend appeared
			.clickAndWait('id=friends_icon')
			.assertText('css=table#friendAll tr:nth-child(2) td:first-child', 'Spam')
			.end(function (err) {
				assert.ok(!err, 'Failed verifyUnregisteredFriend: ' + err);
				done();
			});
  },

	'test addRegisteredFriend': function login(done) {
		helper.browser
			.chain
			.open('/')
			// register henders.spam1@gmail.com
			.open('/logout')
			.open('/register_user')
			.type('email', 'henders.spam1@gmail.com')
			.type('name', 'Spammer1')
      .clickAndWait('submit')
			// log back in henders@gmail.com
			.open('/logout')
			.type('email', 'henders@gmail.com')
      .clickAndWait('submit')
			// Goto friends page
			.clickAndWait('id=friends_icon')
			.assertLocation(helper.rootUrl + "/friends")
			// Add henders.spam1@gmail.com as a friend
      .click('id=addFriendButton')
			.type('email', 'henders.spam1@gmail.com')
			.clickAndWait('id=friendSubmit')
			.assertLocation(helper.rootUrl + "/add_friend")
			.assertText('css=div#messages li:first-child', 'Friend request sent!')
			.assertText('css=table#friendPending tr:nth-child(2) td:first-child', 'Spammer1')
			.assertText('css=table#friendPending tr:nth-child(2) td:nth-child(2)', 'pending')
			.end(function (err) {
				assert.ok(!err, 'Failed addRegisteredFriend test: ' + err);
				done();
			});
  },

	'test verifyRegisteredFriend': function login(done) {
		helper.browser
			.chain
			// log back in henders.spam1@gmail.com to accept friend request
			.open('/logout')
			.type('email', 'henders.spam1@gmail.com')
      .clickAndWait('submit')
			// Goto friends page
			.clickAndWait('id=friends_icon')
			// Approve friend request
			.click('id=friendTabRequests')
			.clickAndWait('id=approve')
			.assertLocation(helper.rootUrl + "/friends")
			.assertText('css=div#messages li:first-child', 'Friend has been accepted into the slavery household!')
			// Clear the dialog box
			.click('css=button')
			// log back in henders@gmail.com
			.open('/logout')
			.type('email', 'henders@gmail.com')
      .clickAndWait('submit')
			// Goto friends page and verify new friend appeared
			.clickAndWait('id=friends_icon')
			.assertText('css=table#friendAll tr:nth-child(3) td:first-child', 'Spammer1')
			.end(function (err) {
				assert.ok(!err, 'Failed verifyRegisteredFriend test: ' + err);
				done();
			});
  },

	'test failDuplicateFriendRequest': function (done) {
		helper.browser
			.chain
			// log back in henders@gmail.com
			.open('/logout')
			.type('email', 'henders@gmail.com')
      .clickAndWait('submit')
			// Goto friends page
			.clickAndWait('id=friends_icon')
			.assertLocation(helper.rootUrl + "/friends")
			// Add henders.spam1@gmail.com as a friend
      .click('id=addFriendButton')
			.type('email', 'henders.spam1@gmail.com')
			.clickAndWait('id=friendSubmit')
			.assertText('css=div#messages li:first-child', "Don't be needy, you already added that friend")
			.end(function (err) {
				assert.ok(!err, 'Failed failDuplicateFriendRequest test: ' + err);
				done();
			});
	},

	'test end': function (done) {
		helper.shutdown(done);
	}
};

