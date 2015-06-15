var regleModel = require('../../Model/Regles/Regle');
var template = require('./AjoutRegle.hbs');

var view = Backbone.View.extend({
	$pageName : $('title'),
	$title : $('#title'),	
	$content : $('#content'),

	//Appelé au moment de l'instanciation	
	initialize: function(){
	},

	event: {
		"submit formAjoutRegle":"valid"
	},

	//Fonction chargée du rendu
	render: function(){
		this.$content.html(template());
		this.$pageName.html("Ajout Règle");
		this.$title.html("Ajouter une Règle");
	},

	valid: function(e){
		e.preventDefault();
		console.log("validation");
		var libRegle = $(e.currentTarget).find('input[type=text]').val();
		var scoreRegle = $(e.currentTarget).find('input[type=number]').val();
		var model = new regleModel({"libregle":libRegle, "scoremin":scoreRegle}).toJSON().save();
	}
	
});

module.exports = view;