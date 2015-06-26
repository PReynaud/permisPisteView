var PutMission = require('./PutMission');
var DeleteMission = require('./DeleteMission');

var Router = Backbone.Router.extend({
	routes: {
		"Jeux/:idJeu/Missions/Ajout": "AjoutMission",
		"Jeux/:idJeu/Missions/Modifier/:id": "ModifMission",
		"Jeux/Missions/Supprimer/:id": "SupprMission",
	},

	initialize: function(){

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