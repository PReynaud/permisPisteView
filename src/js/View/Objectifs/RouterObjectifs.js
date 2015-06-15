var Objectifs = require('./Objectifs');
var Objectif = require('./Objectif');

var Router = Backbone.Router.extend({
	routes: {
		"Objectifs": "Objectifs",
		"Objectifs/:id": "Objectif"
	},

	initialize: function(){

	},

	Objectifs: function(){
		this.Objectifs = new Objectifs();
		this.Objectifs.render();
	},

	Objectif: function(id){
		this.Objectif = new Objectif();
		this.Objectif.render(id);
	}
});

module.exports = Router;