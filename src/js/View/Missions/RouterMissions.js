var PutMission = require('./PutMission');
var DeleteMission = require('./DeleteMission');
var Mission= require('./Mission')
var Router = Backbone.Router.extend({
	routes: {
		"Jeux/:idJeu/Missions/Ajout": "AjoutMission",
		"Jeux/:idJeu/Missions/Modifier/:id": "ModifMission",
		"Jeux/Missions/Supprimer/:id": "SupprMission",
		"Jeux/:idJeu/Missions/:id": "Mission",
	},

	initialize: function(){

	},
	Mission: function(idJeu,id){
		this.Mission = new Mission();
		this.Mission.render(id);
	},
	AjoutMission: function(idJeu){
		this.Mission = new PutMission();
		this.Mission.render(idJeu);
	},

	ModifMission: function(id,idJeu){
		this.Mission = new PutMission();
		this.Mission.renderModif(id,idJeu);
	},

	SupprMission: function(id){
		this.Mission = new DeleteMission();
		this.Mission.render(id);
	}
});

module.exports = Router;