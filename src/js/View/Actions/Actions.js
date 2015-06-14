var acttionsModel = require('../../Model/Actions/ActionsList');
var template = require('./Actions.hbs');

var view = Backbone.View.extend({
	pageName : $('title'),
	title : $('#title'),
	content : $('#content'),

	//Appelé au moment de l'instanciation	
	initialize: function(){
	},

	//Fonction chargée du rendu
	render: function(){
		var model = new acttionsModel().fetch({
			success: _.bind(this.renderResultat, this)
		});
		$(this.pageName).html("Liste des Actions");
		$(this.title).html("Liste des Actions");
	},

	renderResultat: function(response){
		$(this.content).html(template({actions: response.toArray()}));
	}
});

module.exports = view;