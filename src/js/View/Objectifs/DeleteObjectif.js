var objectifModel = require('../../Model/Objectifs/Objectif');
var modal = require('../Global/modal.js');
var Est_associeModel = require('../../Model/Est_associe/Est_associe');

var view = Backbone.View.extend({
	render: function(id){
		var model = new objectifModel({"id":id}).fetch({
			success: _.bind(this.confirm,this)
		});

	},

	renderEstAsso: function(id,idAction){
		console.log("test "+id+" "+idAction);
		var modalView = new modal({
			modalTitle: "Suppression",
		 	modalBody: "Confirmer la suppression",
		 	modalFooter: '<button type="button" class="btn btn-default" data-dismiss="modal" id="annulDelete">Annuler</button><a class="btn btn-danger btn-ok" id="confirmDelete" data-dismiss="modal">Supprimer</a>'
		});
		$('#confirmDelete').on('click',_.bind(function(e){
			var model = new Est_associeModel({"numobjectif":id, "numaction":idAction }).destroy({
				success: _.bind(this.valid,this),
				error: this.showErrorModal
			});
		},this));
		$('#annulDelete').on('click',_.bind(function(e){
			Backbone.history.navigate('#Objectifs/Modifier/'+id, {trigger:true});
		},this));
	},

	confirm:function(objectif){
		var modalView = new modal({
			modalTitle: "Suppression",
		 	modalBody: "Confirmer la suppression",
		 	modalFooter: '<button type="button" class="btn btn-default" data-dismiss="modal" id="annulDelete">Annuler</button><a class="btn btn-danger btn-ok" id="confirmDelete" data-dismiss="modal">Supprimer</a>'
		});
		$('#confirmDelete').on('click',_.bind(function(e){
			var model = new objectifModel({"id":objectif.id}).destroy({
				success: _.bind(this.valid,this),
				error: this.showErrorModal
			});
		},this));
		$('#annulDelete').on('click',_.bind(function(e){
			Backbone.history.navigate('#Objectifs', {trigger:true});
		},this));
	},

	valid:function(){
		var modalView = new modal({
			modalTitle: "Suppression",
		 	modalBody: "Suppression effecuée"
		});
		$('.modal-backdrop').remove();
		Backbone.history.navigate('#Objectifs', {trigger:true});
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