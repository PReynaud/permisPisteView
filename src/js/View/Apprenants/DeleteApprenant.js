var ApprenantModel = require('../../Model/Apprenants/Apprenant');
var modal = require('../Global/modal.js');

var view = Backbone.View.extend({
	render: function(id){
		var model = new ApprenantModel({"id":id}).fetch({
			success: _.bind(this.confirm,this)
		});

	},

	confirm:function(apprenant){
		var modalView = new modal({
			modalTitle: "Suppression",
		 	modalBody: "Confirmer la suppression",
		 	modalFooter: '<button type="button" class="btn btn-default" data-dismiss="modal" id="annulDelete">Annuler</button><a class="btn btn-danger btn-ok" id="confirmDelete" data-dismiss="modal">Supprimer</a>'
		});
		$('#confirmDelete').on('click',_.bind(function(e){
			var model = new ApprenantModel({"id":apprenant.id}).destroy({
				success: _.bind(this.valid,this)
			});
			//$('.modal-backdrop').remove();
			Backbone.history.navigate('#Apprenants', {trigger:true});
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
		Backbone.history.navigate('#Apprenants', {trigger:true});
	},

	showErrorModal: function(error){
		var modalView = new modal({
			modalTitle: "Suppression",
		 	modalBody: "Erreur lors de la suppression : " + error,
		 	modalError: true
		});
	}
});

module.exports = view;