var Regles = require('./Regles');
var Regle = require('./Regle');
var PutRegle = require('./PutRegle');
var DeleteRegle = require('./DeleteRegle');

var Router = Backbone.Router.extend({
	routes: {
		"Regles": "Regles",
		"Regles/Ajout": "AjoutRegle",
		"Regles/Modifier/:id": "ModifRegle",
		"Regles/Supprimer/:id": "SupprRegle",
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
		this.regle = new PutRegle();
		this.regle.render();
	},

	ModifRegle: function(id){
		this.regle = new PutRegle();
		this.regle.renderModif(id);
	},

	SupprRegle: function(id){
		this.regle = new DeleteRegle();
		this.regle.render(id);
	}
});

module.exports = Router;