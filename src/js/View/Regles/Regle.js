var regleModel = require('../../Model/Regles/Regle');
var template = require('./Regle.hbs');

var view = Backbone.View.extend({
	pageName : $('title'),
	title : $('#title'),
	content : $('#content'),

	//Appelé au moment de l'instanciation	
	initialize: function(){
	},

	//Fonction chargée du rendu
	render: function(id){
		var model = new regleModel({"id":id}).fetch({
			success: _.bind(this.renderResultat, this)
		});
		$(this.pageName).html("Détail Règle");
		$(this.title).html("Informations Règle");
	},

	renderResultat: function(regle){
		$(this.content).html(template({regle}));
	}
});

module.exports = view;