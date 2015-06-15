var Regles = require('./Regles');
var Regle = require('./Regle');

var Router = Backbone.Router.extend({
	routes: {
		"Regles": "Regles",
		"Regles/:id": "Regle"
	},

	initialize: function(){

	},

	Regles: function(){
		this.regles = new Regles();
		this.regles.render();
	},

	Regle: function(id){
		this.regle = new Regle();
		this.regle.render(id);
	}
});

module.exports = Router;