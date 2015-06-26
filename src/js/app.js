var Accueil = require('./View/Accueil/Accueil');
var Apprenants = require('./View/Apprenants/RouterApprenants');
var Actions = require('./View/Actions/RouterActions');
var Regles = require('./View/Regles/RouterRegles');
var Indicateurs = require('./View/Indicateurs/RouterIndicateurs');
var Objectifs = require('./View/Objectifs/RouterObjectifs');
var Jeux=require('./View/Jeux/RouterJeux');
var Evaluation = require('./View/Evaluation/RouterEvaluation');
var Missions= require('./View/Missions/RouterMissions')

var Router = Backbone.Router.extend({
	routes: {
		"": "Accueil"
	},

	initialize: function(){

	},

	Accueil: function(){
		this.accueil = new Accueil();
		this.accueil.render();
	}
});

var router = new Router();
var apprenantsRouter = new Apprenants();
var actionsRouter = new Actions();
var reglesRouter = new Regles();
var indicateursRouteur = new Indicateurs();
var objectifsRouteur = new Objectifs();
var evaluationRouteur = new Evaluation();
var JeuxRouteur=new Jeux();
var MissionsRouteur=new Missions();

Backbone.history.start();