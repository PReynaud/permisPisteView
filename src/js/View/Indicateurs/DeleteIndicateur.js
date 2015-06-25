var indicateurModel = require('../../Model/Indicateurs/Indicateur');
var modal = require('../Global/modalView.js');

var view = Backbone.View.extend({
	render: function(id){
		var model = new indicateurModel({"id":id}).fetch({
			success: _.bind(this.confirm,this)
		});

	},

	confirm:function(indicateur){
		var modalView = new modal().showConfirmModal();
		$('#confirmDelete').on('click',_.bind(function(e){
			var model = new indicateurModel({"id":indicateur.id}).destroy({
				success: _.bind(this.valid,this),
				error: new modal().showErrorModal
			});
		},this));
		$('#annulDelete').on('click',_.bind(function(e){
			Backbone.history.navigate('#Indicateurs', {trigger:true});
		},this));
	},

	valid:function(){
		new modal().showEmptyModal("Suppression","Suppression effecuée");
		$('.modal-backdrop').remove();
		Backbone.history.navigate('#Indicateurs', {trigger:true});
	}
});

module.exports = view;