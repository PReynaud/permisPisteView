var apprenantsModel = require('../../Model/Apprenants/ApprenantsList');
var template = require('./Apprenants.hbs');

var view = Backbone.View.extend({
	pageName : $('title'),
	title : $('#title'),
	content : $('#content'),

	//Appelé au moment de l'instanciation	
	initialize: function(){
	},

	//Fonction chargée du rendu
	render: function(){
		var model = new apprenantsModel().fetch({
			success: _.bind(this.renderResultat, this)
		});
		$(this.pageName).html("Liste des Apprenants");
		$(this.title).html("Liste des Apprenants");
	},

	renderResultat: function(response){
		$(this.content).html(template({apprenants: response.toArray()}));
	}
});

module.exports = view;