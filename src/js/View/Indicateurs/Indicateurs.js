var indicateurModel = require('../../Model/Indicateurs/IndicateursList');
var template = require('./Indicateurs.hbs');

var view = Backbone.View.extend({
	pageName : $('title'),
	title : $('#title'),
	content : $('#content'),

	//Appelé au moment de l'instanciation	
	initialize: function(){
	},

	//Fonction chargée du rendu
	render: function(){
		var model = new indicateurModel().fetch({
			success: _.bind(this.renderResultat, this)
		});
		$(this.pageName).html("Liste des Indicateurs");
		$(this.title).html("Liste des Indicateurs");
	},

	renderResultat: function(response){
		$(this.content).html(template({indicateurs: response.toArray()}));
	}
});

module.exports = view;