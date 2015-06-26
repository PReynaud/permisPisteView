var Evaluation = require('./Evaluation');

var Router = Backbone.Router.extend({
	routes: {
		"Evaluation": "Evaluation"
	},

	initialize: function(){

	},

	Evaluation: function(){
		this.evaluation = new Evaluation();
		this.evaluation.render();
	}
});

module.exports = Router;