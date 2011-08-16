var models = require("../models");
var emailer = require('nodemailer'); 
emailer.SMTP = { 
	host: 'smtp.gmail.com', 
	use_authentication: true,
	user: 'henders@gmail.com',
	pass: 'FuckWork!',
	ssl: true,
	port: 465
};

var doStuff = {

	addFriends: function() {
		var email = this.req.body.email;
		var that = this;

		console.log("Adding friend: " + email);
		models.User.findOne({ 'email.like': email
												}, function(err, userFriend) {
			console.log("addFriends: user.findone() - " + 
							JSON.stringify(err) + " : " + 
							JSON.stringify(userFriend));
			that.req.flash('error', JSON.stringify(err));

			// If friend isn't already registered, register/email him and move on
			if (!userFriend) {
				// send user an email to register
				that.inviteUser(email);
				// Add user to system and then createFriend()
				models.User.create( { email: email }, function(err, result) {
					if (!result) {
						that.req.flash('error', 'Failed to create your friend in the system');
						that.req.flash('error', JSON.stringify(err));
						that.res.redirect('/');
					}
					else {
						console.log("Created newUser: " + JSON.stringify(result.rows[0]));
						that.createFriend(result.rows[0]);
					}
				});
			}
			else {
				// Add the friend to DB
				that.createFriend(userFriend);
			}
		});
	},

	renderFriends: function() {
		var that = this;
		var all = [];
		var requests = [];
		var pending = [];

		var filterResults = function (a) {
			for (var i = 0; i < a.length; i++) {
				console.log("ProcessFriend: " + JSON.stringify(a[i]));
				if (a[i].user.id == that.req.session.user.id) {
					if (a[i].approved) {
						all[i] = {name: a[i].friend.name || a[i].friend.email,
											date: a[i].approved_at,
											points: a[i].friend.points};
					}
					else {
						pending[i] = { name: a[i].friend.name || a[i].friend.email };
						pending[i].status = a[i].denied ? 'denied (sorry!)' : 'pending';
					}
				}
				// Else process the friend requests
				else {
					requests[i] = { name: a[i].user.name || a[i].user.email,
													id: a[i].user.id};
				}
			}
		};

		console.log("Rendering the friends screen");
		// Read in all the current friends
		models.Friend.find( {user_id: this.req.session.user.id},
												{include: { user: {}, friend: {}}}, function(err, friendResults) {
			err && that.req.flash('error', JSON.stringify(err));

			filterResults(friendResults);
			// Read in all friend request that haven't been approved
			models.Friend.find( {friend_user_id: that.req.session.user.id,
													 approved: false,
													 denied: false},
													{include: { user: {}, friend: {}}}, function(err2, friendResults) {
				err2 && that.req.flash('error', JSON.stringify(err2));

				filterResults(friendResults);

				that.res.render('friends', {
					title: "Shane's Task Server",
					flash: that.req.flash(),
					all: all,
					requests: requests,
					pending: pending
				});
			});
		});
	},

	createFriend: function(userFriend) {
		var that = this;

		// Check that they didn't already create this link
		models.Friend.findOne({
														user_id: that.req.session.user.id,
														friend_user_id: userFriend.id}, function(err, result) {
				err && that.req.flash('error', JSON.stringify(err));
				if (result && result.id) {
					that.req.flash('info', "Don't be needy, you already added that friend");
					that.res.redirect('/friends');
				}
				else {
					models.Friend.create({
																user_id: that.req.session.user.id,
																friend_user_id: userFriend.id,
																created_at: new Date()
																}, function (err, result) {
						if (err || !result) {
							that.req.flash('error', 'Failed to forge the friendship, please try again later');
							err && that.req.flash('error', JSON.stringify(err));
							that.res.redirect('/');
						}
						else {
							that.req.flash('info', 'Friend request sent!');
							that.renderFriends();
						}
					});
				}
			});
	},

	inviteUser: function(email) {
		var that = this;

		emailer.send_mail({
			sender: 'henders@gmail.com',
			to: email,
			subject: 'Chorealicious: Friend would like you to register',
			body: 'Please register: http://darkninja.com'
		}, function (error, success) {
			if (!success) {
				that.req.flash('error', 'Failed to invite friend to join');
				error && that.req.flash('error', JSON.stringify(error));
			}
			else {
				that.req.flash('info', 'Sent an invite to your friend to join');
			}
		});
	},

	approveFriend: function(id) {
		this.updateFriend(id, {approved: true, approved_at: new Date()},
								'Failed to accept the friendship, please try again later',
								'Friend has been accepted into the slavery household!');
	},

	disapproveFriend: function(id) {
		this.updateFriend(id, {approved: true, approved_at: new Date()},
								'Failed to deny the friendship (karma?), please try again later',
								'Friend has sent to rejection-land!');
	},

	updateFriend: function(id, fields, failureMsg, succesMsg) {
		var that = this;

		// Check that they didn't already create this link
		models.Friend.findOne({
				user_id: id,
				friend_user_id: that.req.session.user.id}, function(err, friend) {
			err && that.req.flash('error', JSON.stringify(err));
			if (!friend || !friend.id) {
				that.req.flash('error', "Hmm... friend wasn't requested, are you cheating the system?");
				that.res.redirect('/friends');
			}
			else {
				models.Friend.update({ id: friend.id }, fields, function (err, result) {
					if (err || !result) {
						that.req.flash('error', failureMsg);
						that.req.flash('error', JSON.stringify(err));
						that.res.redirect('/friends');
					}
					else {
						// create the transitive friend record for approved friend requests
						models.Friend.create({user_id:  friend.friend_user_id,
																	friend_user_id: friend.user_id,
																	approved: true,
																	approved_at: new Date(),
																	created_at: new Date()}, function (err, result) {
							if (err || !result) {
								that.req.flash('error', failureMsg);
								that.req.flash('error', JSON.stringify(err));
							}
							else {
								that.req.flash('info', succesMsg);
							}
							that.res.redirect('/friends');
						});
					}
				});
			}
		});
	}
};

exports.route = function(req, res, action) {
	doStuff.req = req;
	doStuff.res = res;

	console.log("Friends: " + action);
	if (!req.session.user) {
		// User isn't signed in yet, so redirect to login screen
		res.redirect('/login');
	}
	else {
		switch(action) {
			case 'add':
				doStuff.addFriends();
				break;
			case 'get':
				doStuff.renderFriends();
				break;
			case 'approve':
				doStuff.approveFriend(req.params.id);
				break;
			case 'deny':
				doStuff.disapproveFriend(req.params.id);
				break;
			default:
				req.flash('error', 'Unknown friend action (%s)', action);
				res.redirect('/');
		}
	}
};

