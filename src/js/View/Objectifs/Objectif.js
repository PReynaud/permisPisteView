var objectifModel = require('../../Model/Objectifs/Objectif');
var template = require('./Objectif.hbs');

var view = Backbone.View.extend({
	pageName : $('title'),
	title : $('#title'),
	content : $('#content'),

	//Appelé au moment de l'instanciation	
	initialize: function(){
	},

	//Fonction chargée du rendu
	render: function(id){
		var model = new objectifModel({"id":id}).fetch({
			success: _.bind(this.renderResultat, this)
		});
		$(this.pageName).html("Détail Objectif");
		$(this.title).html("Informations Objectif");
	},

	renderResultat: function(objectif){
		//console.log(objectif);
		$(this.content).html(template({objectif}));
	}
});

module.exports = view;