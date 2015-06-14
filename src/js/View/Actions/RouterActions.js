var Actions = require('./Actions');
var Action = require('./Action');

var Router = Backbone.Router.extend({
	routes: {
		"Actions": "Actions",
		"Actions/:id": "Action"
	},

	initialize: function(){

	},

	Actions: function(){
		this.actions = new Actions();
		this.actions.render();
	},

	Action: function(id){
		this.actions = new Action();
		this.actions.render(id);
	}
});

module.exports = Router;