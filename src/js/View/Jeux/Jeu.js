var jeuModel = require('../../Model/Jeux/Jeu');
var template = require('./Jeu.hbs');

var view = Backbone.View.extend({
	pageName : $('title'),
	title : $('#title'),
	content : $('#content'),

	//Appelé au moment de l'instanciation	
	initialize: function(){
	},

	//Fonction chargée du rendu
	render: function(id){
		var model = new jeuModel({"id":id}).fetch({
			success: _.bind(this.renderResultat, this)
		});
		$(this.pageName).html("Détail Jeu");
		$(this.title).html("Informations Jeu");
	},

	renderResultat: function(jeu){
		$(this.content).html(template({jeu}));
	}
});

module.exports = view;