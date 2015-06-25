var Objectifs = require('./Objectifs');
var Objectif = require('./Objectif');
var PutObjectif = require('./PutObjectif');
var DeleteObjectif = require('./DeleteObjectif');

var Router = Backbone.Router.extend({
	routes: {
		"Objectifs": "Objectifs",
		"Objectifs/Ajout": "AjoutObjectif",
		"Objectifs/Modifier/:id": "ModifObjectif",
		"Objectifs/Supprimer/:id": "SupprObjectif",
		"Objectifs/:id": "Objectif"
	},

	initialize: function(){

	},

	Objectifs: function(){
		this.Objectifs = new Objectifs();
		this.Objectifs.render();
	},

	Objectif: function(id){
		this.objectifs = new Objectif();
		this.objectifs.render(id);
	},

	AjoutObjectif: function(){
		this.objectif = new PutObjectif();
		this.objectif.render();
	},

	ModifObjectif: function(id){
		this.objectif = new PutObjectif();
		this.objectif.renderModif(id);
	},

	SupprObjectif: function(id){
		this.objectif = new DeleteObjectif();
		this.objectif.render(id);
	}
});

module.exports = Router;