var apprentisModel = require('./ApprentisList');
var template = require('./Apprentis.hbs');

var view = Backbone.View.extend({
	el : $('body'),

	//Appelé au moment de l'instanciation	
	initialize: function(){
	},

	//Fonction chargée du rendu
	render: function(){
		console.log("Je fais un rendu d'Apprentis");
		var model = new apprentisModel().fetch({
			success: _.bind(this.renderResultat, this)
		});
		$(this.el).append("<h1>Je suis rajouté par backbone</h1>");
	},

	renderResultat: function(response){
		$(this.el).append(template({apprentis: response.toArray()}));
	}
});

module.exports = view;