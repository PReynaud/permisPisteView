var actionModel = require('../../Model/Actions/Action');
var modal = require('../Global/modalView.js');

var view = Backbone.View.extend({
	render: function(id){
		var model = new actionModel({"id":id}).fetch({
			success: _.bind(this.confirm,this)
		});

	},

	confirm:function(action){
		var modalView = new modal().showConfirmModal();
		$('#confirmDelete').on('click',_.bind(function(e){
			var model = new actionModel({"id":action.id}).destroy({
				success: _.bind(this.valid,this),
				error: new modal().showErrorModal
			});
		},this));
		$('#annulDelete').on('click',_.bind(function(e){
			Backbone.history.navigate('#Actions', {trigger:true});
		},this));
	},

	valid:function(){
		var modalView = new modal().showEmptyModal("Suppression","Suppression effecuée");
		$('.modal-backdrop').remove();
		Backbone.history.navigate('#Actions', {trigger:true});
	}
});

module.exports = view;