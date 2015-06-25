var regleModel = require('../../Model/Regles/Regle');
var modal = require('../Global/modalView.js');

var view = Backbone.View.extend({
	render: function(id){
		var model = new regleModel({"id":id}).fetch({
			success: _.bind(this.confirm,this)
		});

	},

	confirm:function(regle){
		var modalView = new modal().showConfirmModal();
		$('#confirmDelete').on('click',_.bind(function(e){
			var model = new regleModel({"id":regle.id}).destroy({
				success: _.bind(this.valid,this),
				error: new modal().showErrorModal
			});
		},this));
		$('#annulDelete').on('click',_.bind(function(e){
			Backbone.history.navigate('#Regles', {trigger:true});
		},this));
	},

	valid:function(){
		var modalView = new modal().showEmptyModal("Suppression","Suppression effecuée");
		$('.modal-backdrop').remove();
		Backbone.history.navigate('#Regles', {trigger:true});
	}
});

module.exports = view;