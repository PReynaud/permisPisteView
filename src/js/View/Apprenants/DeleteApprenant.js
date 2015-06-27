var apprenantModel = require('../../Model/Apprenants/Apprenant');
var modal = require('../Global/modal.js');

var view = Backbone.View.extend({
	render: function(id){
		var model = new apprenantModel({"id":id}).fetch({
			success: _.bind(this.confirm,this),
			error: _.bind(this.showErrorModal,this)
		});

	},

	confirm:function(apprenant){
		var modalView = new modal({
			modalTitle: "Suppression",
		 	modalBody: "Confirmer la suppression",
		 	modalFooter: '<button type="button" class="btn btn-default" data-dismiss="modal" id="annulDelete">Annuler</button><a class="btn btn-danger btn-ok" id="confirmDelete" data-dismiss="modal">Supprimer</a>'
		});
		$('#confirmDelete').on('click',_.bind(function(e){
			var model = new apprenantModel({"id":apprenant.id}).destroy({
				success: _.bind(this.valid,this),
				error: _.bind(this.showErrorModal,this)
			});
		},this));
		$('#annulDelete').on('click',_.bind(function(e){
			Backbone.history.navigate('#Apprenants', {trigger:true});
		},this));
	},

	valid:function(){
		var modalView = new modal({
			modalTitle: "Suppression",
		 	modalBody: "Suppression effecuée"
		});
		$('.modal-backdrop').remove();
		Backbone.history.navigate('#Apprenants', {trigger:true});
		Backbone.history.stop(); 
		Backbone.history.start();
	},

	showModal: function(missionType){
		var ArticleModalBody = "La";
		if(missionType === "Ajout"){
			ArticleModalBody = "L'";
		}
		var modalView = new modal({
			modalTitle: missionType,
		 	modalBody: ArticleModalBody+" "+missionType+" a été effectué avec succès"
		});
		
		Backbone.history.navigate('#Apprenants', {trigger:true});
		window.location.reload();
	},

	showErrorModal: function(object,error){
		if (error.status==201 || error.status==200){
			this.valid();
			return true;
		}
		var modalView = new modal({
			modalTitle: "Erreur "+error.status,
		 	modalBody: "Erreur lors de la suppression : " + error.statusText,
		 	modalError: true
		});
	}
});

module.exports = view;