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
		var model = new objectifModel();
		model.url = model.urlRoot+''+id+"/Action";
		model.fetch({
			success: _.bind(this.renderResultat, this)
		});
		$(this.pageName).html("Détail Objectif");
		$(this.title).html("Informations Objectif");
	},

	renderResultat: function(response){

		var Action = Backbone.Model.extend({
	  	});

		var CollectionAction = Backbone.Collection.extend({
		  model: Action
		});

		var listAction = new CollectionAction();
		for (var element in response.attributes){
			var action = new Action(response.attributes[element][1]);
			listAction.add([action]);
		}
		$(this.content).html(template({objectif: response.attributes[0][2], actions:listAction.models}));
	
	}
});

module.exports = view;