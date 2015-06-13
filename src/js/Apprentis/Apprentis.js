var apprentisModel = require('./ApprentisList');
var template = require('./Apprentis.hbs');

var view = Backbone.View.extend({
	pageName : $('title'),
	title : $('#title'),
	content : $('#content'),

	//Appelé au moment de l'instanciation	
	initialize: function(){
	},

	//Fonction chargée du rendu
	render: function(){
		var model = new apprentisModel().fetch({
			success: _.bind(this.renderResultat, this),
			error: _.bind(this.renderResultat,this)
		});
		console.log(model);
		$(this.pageName).html("Liste des Apprentis");
		$(this.title).html("Liste des Apprentis");
	},

	renderResultat: function(response){
		$(this.content).html(template({apprentis: response.toArray()}));
	}
});

module.exports = view;