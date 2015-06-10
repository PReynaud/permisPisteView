var template = require("./Accueil.hbs");

module.exports = Backbone.View.extend({
	el : $('#example'),

	//Appelé au moment de l'instanciation	
	initialize: function(){
	},

	//Fonction chargée du rendu
	render: function(){
		console.log("Je fais un rendu d'Accueil");
		$(this.el).append(template());
	}
});