var missionModel = require('../../Model/Missions/Mission');
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
		var model = new missionModel({"id":id}).fetch({
			success: _.bind(this.renderResultat, this)
		});
		$(this.pageName).html("Détail Mission");
		$(this.title).html("Informations Mission");
	},

	renderResultat: function(Mission){
		$(this.content).html(template({mission:Mission}));
	}
});

module.exports = view;