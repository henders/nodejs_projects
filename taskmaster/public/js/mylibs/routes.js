console.log('creating routes');
var Controller = Backbone.Router.extend({
	initialize: function() {
		console.log('init the routes');
	},

	routes: {
		'home': "home",
		'addchore': "addChore",
		'show': 'defaultAction',
		'*actions': 'defaultAction'
	},

	home: function() {
		console.log('home function called');
		$('#main').html('home action');
	},

	addChore: function() {},

	defaultAction: function() {
		console.log('default action');
	}
});
var controller = new Controller;
Backbone.history.start({pushState: false});


