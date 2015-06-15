var regleModel = require('../../Model/Regles/ReglesList');
var template = require('./Regles.hbs');

var view = Backbone.View.extend({
	pageName : $('title'),
	title : $('#title'),
	content : $('#content'),

	//Appelé au moment de l'instanciation	
	initialize: function(){
	},

	//Fonction chargée du rendu
	render: function(){
		var model = new regleModel().fetch({
			success: _.bind(this.renderResultat, this)
		});
		$(this.pageName).html("Liste des Règles");
		$(this.title).html("Liste des Règles");
	},

	renderResultat: function(response){
		$(this.content).html(template({regles: response.toArray()}));
	}
});

module.exports = view;