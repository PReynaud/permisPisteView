var regleModel = require('../../Model/Regles/Regle');
var template = require('./AjoutRegle.hbs');
var modal = require('../Global/modal.js');

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
		var libRegle = $('#libRegle').val();
		var scoreAction = $('#scoreAction').val();

		var model = new regleModel();
		model.save({"libregle":libRegle, "scoremin":scoreAction}, {
			success: this.showModal,
			error: this.showErrorModal
		});

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
	},

	showModal: function(){
		var modalView = new modal({
			modalTitle: "Ajout",
		 	modalBody: "L'ajout a été effectué avec succès"
		});
	},

	showErrorModal: function(error){
		var modalView = new modal({
			modalTitle: "Ajout",
		 	modalBody: "Erreur lors de l'ajout : " + error,
		 	modalError: true
		});
	}
});

module.exports = view;