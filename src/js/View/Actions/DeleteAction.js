var ActionModel = require('../../Model/Actions/Action');
var modal = require('../Global/modal.js');

var view = Backbone.View.extend({
	render: function(id){
		var model = new ActionModel({"id":id}).fetch({
			success: _.bind(this.confirm,this)
		});
	},

	confirm:function(action){
		var modalView = new modal({
			modalTitle: "Suppression",
		 	modalBody: "Confirmer la suppression",
		 	modalFooter: '<button type="button" class="btn btn-default" data-dismiss="modal">Annuler</button><a class="btn btn-danger btn-ok" id="confirmDelete" data-dismiss="modal">Supprimer</a>'
		});
		$('#confirmDelete').on('click',_.bind(function(e){
			var model = new ActionModel({"id":action.id}).destroy({
				success: _.bind(this.valid,this),
				error: this.showErrorModal
			});
		},this));
	},

	valid:function(){
		var modalView = new modal({
			modalTitle: "Suppression",
		 	modalBody: "Suppression effecuée"
		});

		$('.modal-backdrop').remove();
		
		Backbone.history.navigate('#Actions', {trigger:true});
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