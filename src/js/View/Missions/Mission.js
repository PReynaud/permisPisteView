var missionModel = require('../../Model/Missions/Mission');
var objectifList= require('../../Model/Fixe/Fixe')
var template = require('./Mission.hbs');

var view = Backbone.View.extend({
	pageName : $('title'),
	title : $('#title'),
	content : $('#content'),

	//Appelé au moment de l'instanciation	
	initialize: function(){
	},

	//Fonction chargée du rendu
	render: function(id){
		var objectifs=new objectifList();
		console.log(id);
		objectifs.urlRoot=objectifs.urlRoot+''+id+"/Objectif";
		$.when(new missionModel({"id":id}).fetch(),objectifs.fetch())
		.done(_.bind(function(mission,objectifs){
			this.renderResultat(mission,objectifs);
		},this));
		$(this.pageName).html("Détail Mission");
		$(this.title).html("Informations Mission");
	},

	renderResultat: function(mission,objectifs){
		console.log(mission);
		$(this.content).html(template({mission:mission[0],objectifs:objectifs[0]}));
	}
});

module.exports = view;