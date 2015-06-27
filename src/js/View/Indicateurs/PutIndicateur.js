var indicateurModel = require('../../Model/Indicateurs/Indicateur');
var actionModel= require ('../../Model/Actions/ActionsList')
var template = require('./PutIndicateur.hbs');
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
		$.when(null,new actionModel().fetch())
		.done(_.bind(function(indicateur, response){
		this.renderResultat(null,response);
        },this));
	},
	renderModif: function(id){
		$.when(new indicateurModel({"id":id}).fetch(),new actionModel().fetch())
		.done(_.bind(function(indicateur, response){
		this.renderResultat(indicateur,response);
        },this));
		this.$pageName.html("Modifier Indicateur");
		this.$title.html("Modifier un Indicateur");
		this.idIndicateur=id;
	},
	valid: function(e){
		var libIndicateur = $('#libIndicateur').val();
		var scoreAction = $('#actionIndicateur').val();
		var libPoids=$('#poidsIndicateur').val();
		console.log(libIndicateur+" "+scoreAction+" "+libPoids);
		var model = new indicateurModel();
		if(this.idIndicateur===undefined)
		{
			console.log(model);
			model.save({"libindic":libIndicateur, "numaction":scoreAction ,"poids":libPoids}, {
				success: this.showModal,
				error: _.bind(this.showErrorModal,this)
			});
		}
		else
		{
			model.save({"numindic":this.idIndicateur,"libindic":libIndicateur, "numaction":scoreAction ,"poids":libPoids}, {
				success: this.showModal,
				error: _.bind(this.showErrorModal,this)
			});
		}

		return true;
	},
	renderResultat: function(indicateur,response){
		if(indicateur===null)
		{
			$(this.$content).html(template({actions: response[0]}));
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
	},
	showModal: function(){
		var modalView = new modal({
			modalTitle: "Ajout",
		 	modalBody: "L'ajout a été effectué avec succès"
		});
		Backbone.history.navigate('#Indicateurs', {trigger:true});
	},

	showErrorModal: function(object,error){
		if (error.status==201){
			this.showModal();
			return true;
		}
		var modalView = new modal({
			modalTitle: "Erreur "+error.status,
		 	modalBody: "Erreur lors de l'ajout : " + error.statusText,
		 	modalError: true
		});
	}
});

module.exports = view;