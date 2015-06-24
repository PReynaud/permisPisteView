var actionModel = require('../../Model/Actions/Action');
var actionsModel = require('../../Model/Actions/ActionsList');
var template = require('./AjoutAction.hbs');
var modal = require('../Global/modal.js');

var view = Backbone.View.extend({
	$pageName : $('title'),
	$title : $('#title'),	
	$content : $('#content'),

	el: $('#formAjoutAction'),

	//Appelé au moment de l'instanciation	
	initialize: function(){
	},

	//Fonction chargée du rendu
	render: function(){
		this.$pageName.html("Ajout Action");
		this.$title.html("Ajouter une Action");

		var $formAjoutAction = $('#formAjoutAction');

		$formAjoutAction.submit(_.bind(function(event){
		    this.valid();
		}, this));
	},

	renderModif: function(id){
		$.when(new actionModel({"id":id}).fetch(),new actionsModel().fetch())
		.done(_.bind(function(action, actions){
			this.renderResultat(action,actions);
		},this));		
		this.$pageName.html("Modifier Action");
		this.$title.html("Modifier une Action");
		this.idAction=id;
	},

	valid: function(e){
		var actNumaction = $('#actNumaction').val();
		var libaction = $('#libaction').val();
		var scoremin = $('#scoremin').val();

		var model = new actionModel();
		if (this.idAction===undefined){
			model.save({"actNumaction":actNumaction, "libaction":libaction, "scoremin":scoremin}, {
				success: this.showModal,
				error: this.showErrorModal
			}); 
		}
		else{
			model.save({"id":this.idAction, "actNumaction":actNumaction, "libaction":libaction, "scoremin":scoremin}, {
				success: this.showModal,
				error: this.showErrorModal
			});
		} 
		return true;
	},

	renderResultat: function(response,responseList){
		this.$content.html(template({action: response[0], actions:responseList[0]}));
		var $formAjoutAction = $('#formAjoutAction');

		$formAjoutAction.submit(_.bind(function(event){
		    this.valid();
		}, this));
	},

	showModal: function(){
		var modalView = new modal({
			modalTitle: "Ajout",
		 	modalBody: "L'ajout a été effectué avec succès"
		});
		
		Backbone.history.navigate('#Actions', {trigger:true});
	},

	showErrorModal: function(error){
		var modalView = new modal({
			modalTitle: "Ajout",
		 	modalBody: "Erreur lors de l'ajout : " + error,
		 	modalError: true
		});
	}
});

module.exports = view;