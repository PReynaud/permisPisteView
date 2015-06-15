var objectifModel = require('../../Model/Objectifs/ObjectifsList');
var template = require('./Objectifs.hbs');

var view = Backbone.View.extend({
	pageName : $('title'),
	title : $('#title'),
	content : $('#content'),

	//Appelé au moment de l'instanciation	
	initialize: function(){
	},

	//Fonction chargée du rendu
	render: function(){
		var model = new objectifModel().fetch({
			success: _.bind(this.renderResultat, this)
		});
		$(this.pageName).html("Liste des Objectifs");
		$(this.title).html("Liste des Objectifs");
	},

	renderResultat: function(response){
		$(this.content).html(template({objectifs: response.toArray()}));
	}
});

module.exports = view;