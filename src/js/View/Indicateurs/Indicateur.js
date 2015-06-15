var indicateurModel = require('../../Model/Indicateurs/Indicateur');
var template = require('./Indicateur.hbs');

var view = Backbone.View.extend({
	pageName : $('title'),
	title : $('#title'),
	content : $('#content'),

	//Appelé au moment de l'instanciation	
	initialize: function(){
	},

	//Fonction chargée du rendu
	render: function(id){
		var model = new indicateurModel({"id":id}).fetch({
			success: _.bind(this.renderResultat, this)
		});
		$(this.pageName).html("Détail Indicateur");
		$(this.title).html("Informations Indicateur");
	},

	renderResultat: function(indicateur){
		$(this.content).html(template({indicateur}));
	}
});

module.exports = view;