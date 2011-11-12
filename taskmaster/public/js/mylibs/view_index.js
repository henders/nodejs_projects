// Create the View
var IndexView = Backbone.View.extend({
	el: $('#main'),

	initialize: function() {
		var self = this;
		console.log("creating index view!!!");
		$.get("/templates/index.htm", function(data) {
			console.log(data);
			opts = {
				types: ['asd', 'dsa'], 
				friends: [], 
				userIds: [], 
				user: {name:'asd'}
			};
			self.template = _.template(data, {options: JSON.stringify(opts)});
			//alert('view init:');
			self.render();
		});
	},

	render: function() {
		this.el.html(this.template);
	}
});
var index = new IndexView;

