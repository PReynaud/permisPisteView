var Accueil = require('./Accueil/Accueil');
var Apprentis = require('./Apprentis/Apprentis');

var Router = Backbone.Router.extend({
	routes: {
		"": "Accueil",
		"Apprentis": "Apprentis"
	},

	initialize: function(){

	},

	Accueil: function(){
		console.log("Je route vers l'accueil");
		this.accueil = new Accueil();
		this.accueil.render();
	},

	Apprentis: function(){
		console.log("Je route vers Apprentis");
		this.apprentis = new Apprentis();
		this.apprentis.render();
	}
});

var router = new Router();

Backbone.history.start();