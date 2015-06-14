var apprenantModel = require('../../Model/Apprenants/Apprenant');
var template = require('./Apprenant.hbs');

var view = Backbone.View.extend({
	pageName : $('title'),
	title : $('#title'),
	content : $('#content'),

	//Appelé au moment de l'instanciation	
	initialize: function(){
	},

	//Fonction chargée du rendu
	render: function(id){
		var model = new apprenantModel({"id":id}).fetch({
			success: _.bind(this.renderResultat, this)
		});
		$(this.pageName).html("Détail Apprenant");
		$(this.title).html("Informations Apprenant");
	},

	renderResultat: function(apprenant){
		$(this.content).html(template({apprenant}));
	}
});

module.exports = view;