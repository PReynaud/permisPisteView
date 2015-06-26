var jeuxModel = require('../../Model/Jeux/JeuxList');
var template = require('./Jeux.hbs');
/*var missionModel=require('../../Model/Missions/MissionsList');*/

var view = Backbone.View.extend({
	pageName : $('title'),
	title : $('#title'),
	content : $('#content'),

	//Appelé au moment de l'instanciation	
	initialize: function(){
	},

	//Fonction chargée du rendu
	render: function(){
		$.when(new jeuxModel().fetch())
		.done(_.bind(function(jeux){
			this.renderResultat(jeux);
		},this));
		$(this.pageName).html("Liste des Jeux");
		$(this.title).html("Liste des Jeux");
	},

	renderResultat: function(response){
		console.log(response);
		$(this.content).html(template({jeux:response}));
	}
});

module.exports = view;