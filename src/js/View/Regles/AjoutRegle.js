var regleModel = require('../../Model/Regles/Regle');
var template = require('./AjoutRegle.hbs');

var view = Backbone.View.extend({
	$pageName : $('title'),
	$title : $('#title'),	
	$content : $('#content'),

	el: $('#formAjoutRegle'),

	//Appelé au moment de l'instanciation	
	initialize: function(){
	},

	//Fonction chargée du rendu
	render: function(){
		this.$content.html(template());
		this.$pageName.html("Ajout Règle");
		this.$title.html("Ajouter une Règle");

		var $submitButton = $('#submitButton');

		$submitButton.click(_.bind(function(event){
		    this.valid();
		}, this));
	},

	valid: function(e){
		console.log("validation");
		var libRegle = $('#libRegle').val();
		var scoreAction = $('#scoreAction').val();

		var model = new regleModel();
		model.save({"libregle":libRegle, "scoremin":scoreAction});


		/* Seconde méthode pour requêter, peut valloir le coup de la garder au cas ou...
		var info = {
			    libregle: "gerq", 
			    scoremin: "15"
		};
		$.ajax({
			type: "POST",
			url: "http://localhost:8080/Regle/",
			data: JSON.stringify(info),
			dataType: "application/json",
			contentType: "application/json"
		});*/

		return true;
	}
	
});

module.exports = view;