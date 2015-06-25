var indicateurModel = require('../../Model/Indicateurs/Indicateur');
var actionModel= require ('../../Model/Actions/ActionsList')
var template = require('./AjoutIndicateur.hbs');
var modal = require('../Global/modal.js');

var view = Backbone.View.extend({
	$pageName : $('title'),
	$title : $('#title'),	
	$content : $('#content'),

	el: $('#formAjoutIndicateur'),

	//Appelé au moment de l'instanciation	
	initialize: function(){
	},

	//Fonction chargée du rendu
	render: function(){
		this.$pageName.html("Ajout Indicateur");
		this.$title.html("Ajouter un Indicateur");
		var actionmodel= new actionModel().fetch({
			success: _.bind(this.renderList, this)
		});

		var $formAjoutIndicateur= $('#formAjoutIndicateur');

		$formAjoutIndicateur.submit(_.bind(function(event){
		    this.valid();
		}, this));
	},
	renderList: function(response){
		$(this.$content).html(template({actions: response.toArray()}));
	},
	renderModif: function(id){
		var model = new indicateurModel({"id":id}).fetch({
			success: _.bind(this.renderResultat, this)
		});
		this.$pageName.html("Modifier Indicateur");
		this.$title.html("Modifier un Indicateur");
		this.idIndicateur=id;
	},
	valid: function(e){
		var libIndicateur = $('#libIndicateur').val();
		console.log($('#libIndicateur').val());
		var scoreAction = $('#actionIndicateur').val();
		var libPoids=$('#poidsIndicateur').val();
		var model = new indicateurModel();
		if(this.idIndicateur===undefined)
		{
			model.save({"libIndicateur":libIndicateur, "actionIndicateur":scoreAction ,"poidsIndicateur":libPoids}, {
				success: this.showModal,
				error: this.showErrorModal
			});
		}
		else
		{
			model.save({"id":this.idIndicateur,"libIndicateur":libIndicateur, "actionIndicateur":scoreAction ,"poidsIndicateur":libPoids}, {
				success: this.showModal,
				error: this.showErrorModal
			});
		}

		return true;
	},
	renderResultat: function(indicateur){
		this.$content.html(template({indicateur}));
		var $formAjoutIndicateur = $('#formAjoutIndicateur');

		$formAjoutIndicateur.submit(_.bind(function(event){
		    this.valid();
		}, this));
	},
	showModal: function(){
		var modalView = new modal({
			modalTitle: "Ajout",
		 	modalBody: "L'ajout a été effectué avec succès"
		});
		Backbone.history.navigate('#Indicateurs', {trigger:true});
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