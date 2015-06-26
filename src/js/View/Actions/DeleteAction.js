var actionModel = require('../../Model/Actions/Action');
var possedeModel = require('../../Model/Possede/Possede');
var modal = require('../Global/modal.js');

var view = Backbone.View.extend({
	render: function(id){
		var model = new actionModel({"id":id}).fetch({
			success: _.bind(this.confirm,this)
		});

	},

	renderPossede: function(id,iRegle){
		var modalView = new modal({
			modalTitle: "Suppression",
		 	modalBody: "Confirmer la suppression",
		 	modalFooter: '<button type="button" class="btn btn-default" data-dismiss="modal" id="annulDelete">Annuler</button><a class="btn btn-danger btn-ok" id="confirmDelete" data-dismiss="modal">Supprimer</a>'
		});
		$('#confirmDelete').on('click',_.bind(function(e){
			var model = new possedeModel({"numaction":id, "numregle":iRegle}).destroy({
				success: _.bind(this.valid,this),
				error: this.showErrorModal
			});
		},this));
		$('#annulDelete').on('click',_.bind(function(e){
			Backbone.history.navigate('#Actions/Modifier/'+id, {trigger:true});
		},this));
	},

	confirm:function(action){
		var modalView = new modal({
			modalTitle: "Suppression",
		 	modalBody: "Confirmer la suppression",
		 	modalFooter: '<button type="button" class="btn btn-default" data-dismiss="modal" id="annulDelete">Annuler</button><a class="btn btn-danger btn-ok" id="confirmDelete" data-dismiss="modal">Supprimer</a>'
		});
		$('#confirmDelete').on('click',_.bind(function(e){
			var model = new actionModel({"id":action.id}).destroy({
				success: _.bind(this.valid,this),
				error: this.showErrorModal
			});
		},this));
		$('#annulDelete').on('click',_.bind(function(e){
			Backbone.history.navigate('#Actions', {trigger:true});
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