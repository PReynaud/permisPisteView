var apprenantModel = require('../../Model/Apprenants/Apprenant');
var template = require('./PutApprenant.hbs');
var modal = require('../Global/modal.js');

var view = Backbone.View.extend({
	$pageName : $('title'),
	$title : $('#title'),	
	$content : $('#content'),

	el: $('#formPutApprenant'),

	//Appelé au moment de l'instanciation	
	initialize: function(){
	},

	//Fonction chargée du rendu
	render: function(){
		this.renderResultat(undefined);
		this.$pageName.html("Ajout Apprenant");
		this.$title.html("Ajouter un Apprenant");
	},

	renderModif: function(id){
		$.when(new apprenantModel({"id":id}).fetch())
		.done(_.bind(function(apprenant){
			this.renderResultat(apprenant);
		},this));		
		this.$pageName.html("Modifier Apprenant");
		this.$title.html("Modifier un Apprenant");
		this.idApprenant=id;
	},

	valid: function(e){
		var nomapprenant = $('#nomapprenant').val();
		var prenomapprenant = $('#prenomapprenant').val();

		var model = new apprenantModel();
		if (this.idApprenant===undefined){
			model.save({"nomapprenant":nomapprenant, "prenomapprenant":prenomapprenant}, {
				success: this.showErrorModal,
				error: this.showModal
			});
		}
		else{
			model.save({"numapprenant":this.idApprenant, "nomapprenant":nomapprenant, "prenomapprenant":prenomapprenant}, {
				success: this.showErrorModal,
				error: this.showModal
			});
		} 
		return true;
	},

	renderResultat: function(response){
		if(response===undefined){
			this.$content.html(template());
		}else{
			this.$content.html(template({apprenti: response}));
		}

		$('#formPutApprenant').submit(_.bind(function(event){
		    this.valid();
		}, this));
	},

	showModal: function(){
		var modalView = new modal({
			modalTitle: "Ajout",
		 	modalBody: "L'ajout a été effectué avec succès"
		});
		Backbone.history.navigate('#Apprenants', {trigger:true});
	},

	showErrorModal: function(error){
		var modalView = new modal({
			modalTitle: "Ajout",
		 	modalBody: "Erreur lors de l'ajout : " + error,
		 	modalError: true
		});
		Backbone.history.navigate('#Apprenants', {trigger:true});
	}
});

module.exports = view; 