var jeuxModel = require('../../Model/Jeux/JeuxList');
var template = require('./Jeux.hbs');

var view = Backbone.View.extend({
	pageName : $('title'),
	title : $('#title'),
	content : $('#content'),

	//Appelé au moment de l'instanciation	
	initialize: function(){
	},

	//Fonction chargée du rendu
	render: function(){
		var model = new jeuxModel().fetch({
			success: _.bind(this.renderResultat, this)
		});
		$(this.pageName).html("Liste des Jeux");
		$(this.title).html("Liste des Jeux");
	},

	renderResultat: function(response){
		$(this.content).html(template({jeux: response.toArray()}));
	}
});

module.exports = view;