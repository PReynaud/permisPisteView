var indicateurModel = require('../../Model/Indicateurs/Indicateur');
var modal = require('../Global/modal.js');

var view = Backbone.View.extend({
	render: function(id){
		var model = new indicateurModel({"id":id}).fetch({
			success: _.bind(this.confirm,this)
		});

	},

	confirm:function(indicateur){
		var modalView = new modal({
			modalTitle: "Suppression",
		 	modalBody: "Confirmer la suppression",
		 	modalFooter: '<button type="button" class="btn btn-default" data-dismiss="modal" id="annulDelete">Annuler</button><a class="btn btn-danger btn-ok" id="confirmDelete" data-dismiss="modal">Supprimer</a>'
		});
		$('#confirmDelete').on('click',_.bind(function(e){
			var model = new indicateurModel({"id":indicateur.id}).destroy({
				success: _.bind(this.valid,this),
				error: _.bind(this.showErrorModal,this)
			});
		},this));
		$('#annulDelete').on('click',_.bind(function(e){
			Backbone.history.navigate('#Indicateurs', {trigger:true});
		},this));
	},

	valid:function(){
		var modalView = new modal({
			modalTitle: "Suppression",
		 	modalBody: "Suppression effecuée"
		});
		$('.modal-backdrop').remove();
		Backbone.history.navigate('#Indicateurs', {trigger:true});
	},

	showErrorModal: function(object,error){
		if (error.status==201){
			this.showModal();
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