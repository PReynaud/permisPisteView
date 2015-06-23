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

		var $formAjoutRegle = $('#formAjoutRegle');

		$formAjoutRegle.submit(_.bind(function(event){
		    this.valid();
		}, this));
	},

	renderModif: function(id){
		var model = new regleModel({"id":id}).fetch({
			success: _.bind(this.renderResultat, this)
		});
		this.$pageName.html("Modifier Règle");
		this.$title.html("Modifier une Règle");
		this.idRegle=id;
	},

	valid: function(e){
		var libRegle = $('#libRegle').val();
		var scoreAction = $('#scoreAction').val();

		var model = new regleModel();
		if (this.idRegle===undefined){
			model.save({"libregle":libRegle, "scoremin":scoreAction}, {
				success: this.showModal,
				error: this.showErrorModal
			}); 
		}
		else{
			model.save({"id":this.idRegle, "libregle":libRegle, "scoremin":scoreAction}, {
				success: this.showModal,
				error: this.showErrorModal
			});
		} 
		return true;
	},

	renderResultat: function(regle){
		this.$content.html(template({regle}));
		var $formAjoutRegle = $('#formAjoutRegle');

		$formAjoutRegle.submit(_.bind(function(event){
		    this.valid();
		}, this));
	},

	showModal: function(){
		var modalView = new modal({
			modalTitle: "Ajout",
		 	modalBody: "L'ajout a été effectué avec succès"
		});
		modalview.on('hidden.bs.modal',function(e){
			Backbone.history.navigate('#Regles', {trigger:true});
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