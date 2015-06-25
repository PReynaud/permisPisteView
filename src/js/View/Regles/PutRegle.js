var regleModel = require('../../Model/Regles/Regle');
var template = require('./PutRegle.hbs');
var modal = require('../Global/modal.js');

var view = Backbone.View.extend({
	$pageName : $('title'),
	$title : $('#title'),	
	$content : $('#content'),

	el: $('#formPutRegle'),

	//Appelé au moment de l'instanciation	
	initialize: function(){
	},

	//Fonction chargée du rendu
	render: function(){
		$.when(null)
		.done(_.bind(function(regle){
			this.renderResultat(null);
		},this));
		this.$pageName.html("Ajout Regle");
		this.$title.html("Ajouter une Regle");
	},

	renderModif: function(id){
		$.when(new regleModel({"id":id}).fetch())
		.done(_.bind(function(regle){
			this.renderResultat(regle);
		},this));		
		this.$pageName.html("Modifier Regle");
		this.$title.html("Modifier une Regle");
		this.idAction=id;
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
		if(regle === null){
			this.$content.html(template());
		}else{
			this.$content.html(template({regle:regle}));
		}
		$('#formPutRegle').submit(_.bind(function(event){
		    this.valid();
		}, this));
	},

	showModal: function(){
		var modalView = new modal({
			modalTitle: "Ajout",
		 	modalBody: "L'ajout a été effectué avec succès"
		});
		
		Backbone.history.navigate('#Regles', {trigger:true});
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