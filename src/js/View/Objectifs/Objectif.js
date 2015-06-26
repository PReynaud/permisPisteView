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

		$.when(new objectifModel({"id":id}).fetch(),model.fetch())
		.done(_.bind(function(objectif,actions){
			this.renderResultat(objectif,actions);
		},this));
		
		this.idObjectif = id;
		$(this.pageName).html("Détail Objectif");
		$(this.title).html("Informations Objectif");
	},

	renderResultat: function(response, responseActions){
		var Action = Backbone.Model.extend({
	  	});

		var CollectionAction = Backbone.Collection.extend({
		  model: Action
		});
		var count = 0;
		var listAction = new CollectionAction();
		for (var i = 0; i <  responseActions[0].length; i++) {
			console.log(responseActions[0][i][1]);
			var action = new Action(responseActions[0][i][1]);
			listAction.add([action]);
			count++;
		}

		if(count !==0 ){
			$(this.content).html(template({objectif: response[0], actions:listAction.models}));
		}else{
			$(this.content).html(template({objectif: response[0]}));
		}
	
	}
});

module.exports = view;