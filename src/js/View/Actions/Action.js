var actionModel = require('../../Model/Actions/Action');
var template = require('./Action.hbs');

var view = Backbone.View.extend({
	pageName : $('title'),
	title : $('#title'),
	content : $('#content'),

	//Appelé au moment de l'instanciation	
	initialize: function(){
	},

	//Fonction chargée du rendu
	render: function(id){
		//Recuperation
		var model = new actionModel({"id":id}).fetch({
			success: _.bind(this.renderResultat, this)
		});
		$(this.pageName).html("Détail Action");
		$(this.title).html("Informations Action");
	},

	renderResultat: function(action){
		$(this.content).html(template({action}));
	}
});

module.exports = view;