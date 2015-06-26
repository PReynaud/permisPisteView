var actionModel = require('../../Model/Actions/Action');
var regleModel = require('../../Model/Regles/Regle');
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
		var model = new regleModel();
		model.url = model.urlRoot+'/Action/'+id;

		$.when( new actionModel({"id":id}).fetch(),model.fetch())
		.done(_.bind(function(objectif,actions){
			this.renderResultat(objectif,actions);
		},this));
		$(this.pageName).html("Détail Action");
		$(this.title).html("Informations Action");
	},

	renderResultat: function(response, responseRegles){

		// Refactoring list des règle pour que ça soit plus lisible
		var Regle = Backbone.Model.extend({
	  	});
		var CollectionRegle = Backbone.Collection.extend({
		  model: Regle
		});
		var count = 0;
		var listRegle = new CollectionRegle();
		for (var i = 0; i <  responseRegles[0].length; i++) {
			var regle = new Regle(responseRegles[0][i][0]);
			listRegle.add([regle]);
			count++;
		}

		// Passe les élément à la vue
		if(count !==0 ){
			$(this.content).html(template({action: response[0], regles:listRegle.models}));
		}else{
			$(this.content).html(template({action: response[0]}));
		}
	}
});

module.exports = view;