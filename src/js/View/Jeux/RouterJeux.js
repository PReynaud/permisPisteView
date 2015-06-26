var Jeux = require('./Jeux');
var Jeu = require('./Jeu');
var PutJeu = require('./PutJeu');
var DeleteJeu = require('./DeleteJeu');

var Router = Backbone.Router.extend({
	routes: {
		"Jeux": "Jeux",
		"Jeux/Ajout": "AjoutJeu",
		"Jeux/Modifier/:id": "ModifJeu",
		"Jeux/Supprimer/:id": "SupprJeu",
		"Jeux/:id": "Jeu"
	},

	initialize: function(){

	},

	Jeux: function(){
		this.Jeux = new Jeux();
		this.Jeux.render();
	},

	Jeu: function(id){
		this.Jeu = new Jeu();
		this.Jeu.render(id);
	},

	AjoutJeu: function(){
		this.Jeu = new PutJeu();
		this.Jeu.render();
	},

	ModifJeu: function(id){
		this.Jeu = new PutJeu();
		this.Jeu.renderModif(id);
	},

	SupprJeu: function(id){
		this.Jeu = new DeleteJeu();
		this.Jeu.render(id);
	}
});

module.exports = Router;