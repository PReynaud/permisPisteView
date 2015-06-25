var Indicateurs = require('./Indicateurs');
var Indicateur = require('./Indicateur');
var AjoutIndicateur = require('./AjoutIndicateur');
var DeleteIndicateur = require('./DeleteIndicateur');

var Router = Backbone.Router.extend({
	routes: {
		"Indicateurs": "Indicateurs",
		"Indicateurs/Ajout": "AjoutIndicateur",
		"Indicateurs/Modifier/:id": "ModifIndicateur",
		"Indicateurs/Supprimer/:id": "SupprIndicateur",
		"Indicateurs/:id": "Indicateur"
	},

	initialize: function(){

	},

	Indicateurs: function(){
		this.Indicateurs = new Indicateurs();
		this.Indicateurs.render();
	},

	Indicateur: function(id){
		this.Indicateur = new Indicateur();
		this.Indicateur.render(id);
	},

	AjoutIndicateur: function(){
		this.Indicateur = new AjoutIndicateur();
		this.Indicateur.render();
	},
	ModifIndicateur: function(id){
		this.Indicateur = new AjoutIndicateur();
		this.Indicateur.renderModif(id);
	},
	SupprIndicateur: function(id){
		this.indicateur = new DeleteIndicateur();
		this.indicateur.render(id);
	}
});

module.exports = Router;