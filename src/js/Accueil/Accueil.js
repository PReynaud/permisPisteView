module.exports = Backbone.View.extend({
	el : $('body'),

	//Appelé au moment de l'instanciation	
	initialize: function(){
	},

	//Fonction chargée du rendu
	render: function(){
		console.log("Je fais un rendu d'Accueil");
		$(this.el).append("<h1>Je suis rajouté par l'accueil</h1><a href=\"Apprentis\">BANANA</a>");
	}
});