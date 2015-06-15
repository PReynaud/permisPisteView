var Jeux = require('./Jeux');
var Jeu = require('./Jeu');

var Router = Backbone.Router.extend({
	routes: {
		"Jeux": "Jeux",
		"Jeux/:id": "Jeu"
	},

	initialize: function(){

	},

	Jeux: function(){
		this.jeux = new Jeux();
		this.jeux.render();
	},

	Jeu: function(id){
		this.jeux = new Jeu();
		this.jeux.render(id);
	}
});

module.exports = Router;