var indicateurModel = require('../../Model/Indicateurs/Indicateur');
var actionModel= require ('../../Model/Actions/ActionsList')
var template = require('./AjoutIndicateur.hbs');
var modal = require('../Global/modalView.js');

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
		$.when(new actionModel().fetch())
		.done(_.bind(function(response){
		this.renderResultat(response);
        },this));
	},

	renderModif: function(id){
		$.when(new indicateurModel({"id":id}).fetch(),new actionModel().fetch())
		.done(_.bind(function(indicateur, response){
		this.renderResultat(response,indicateur);
        },this));
		this.$pageName.html("Modifier Indicateur");
		this.$title.html("Modifier un Indicateur");
		this.idIndicateur=id;
	},

	valid: function(e){
		var libIndicateur = $('#libIndicateur').val();
		var numaction = $('#actionIndicateur').val();
		var libPoids=$('#poidsIndicateur').val();
		var model = new indicateurModel();
		if(this.idIndicateur===undefined)
		{
			model.save({"libindic":libIndicateur, "numaction":numaction ,"poids":libPoids}, {
				success: new modal().showModal("Ajout","#Indicateurs"),
				error: new modal().showErrorModal
			});
		}
		else
		{
			model.save({"id":this.idIndicateur,"libindic":libIndicateur, "numaction":numaction ,"poids":libPoids}, {
				success: new modal().showModal("Modifification","#Indicateurs"),
				error: new modal().showErrorModal
			});
		}

		return true;
	},

	renderResultat: function(response,indicateur){
		if(indicateur===undefined)
		{
			$(this.$content).html(template({actions: response}));
		}
		else
		{
			this.$content.html(template({indicateur:indicateur[0],actions: response[0]}));
			$("#actionIndicateur option[value='"+indicateur[0].numaction+"']").attr("selected", "selected");
		}
		var $formAjoutIndicateur = $('#formAjoutIndicateur');

		$formAjoutIndicateur.submit(_.bind(function(event){
		    this.valid();
		}, this));
	}
});

module.exports = view;