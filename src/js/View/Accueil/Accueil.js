var template = require("./Accueil.hbs");



module.exports = Backbone.View.extend({
	content : $('#content'),
	title : $('#title'),

	//Appelé au moment de l'instanciation	
	initialize: function(){
	},

	//Fonction chargée du rendu
	render: function(){
		$(this.title).html("Projet permis piste");
		$(this.content).html(template());
	}
});