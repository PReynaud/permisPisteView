var Regles = require('./Regles');
var Regle = require('./Regle');
var AjoutRegle = require('./AjoutRegle');

var Router = Backbone.Router.extend({
	routes: {
		"Regles": "Regles",
		"Regles/Ajout": "AjoutRegle",
		"Regles/Modifier/:id": "ModifRegle",
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
	},

	AjoutRegle: function(){
		this.regle = new AjoutRegle();
		this.regle.render();
	},

	ModifRegle: function(id){
		this.regle = new AjoutRegle();
		this.regle.renderModif(id);
	}
});

module.exports = Router;