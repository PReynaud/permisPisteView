var jeuModel = require('../../Model/Jeux/Jeu');
var jeuxModel = require('../../Model/Jeux/JeuxList');
var template = require('./PutJeu.hbs');
var modal = require('../Global/modal.js');

var view = Backbone.View.extend({
	$pageName : $('title'),
	$title : $('#title'),	
	$content : $('#content'),

	el: $('#formPutJeu'),

	//Appelé au moment de l'instanciation	
	initialize: function(){
	},

	//Fonction chargée du rendu
	render: function(){
		$.when(new jeuxModel().fetch())
		.done(_.bind(function(jeux){
			this.renderResultat(jeux);
		},this));
		this.$pageName.html("Ajout Jeu");
		this.$title.html("Ajouter un Jeu");
	},

	renderModif: function(id){
		$.when(new jeuxModel().fetch(),new jeuModel({"id":id}).fetch())
		.done(_.bind(function(jeux,jeu){
			this.renderResultat(jeux,jeu);
		},this));		
		this.$pageName.html("Modifier Jeu");
		this.$title.html("Modifier un Jeu");
		this.idAction=id;
	},

	valid: function(e){
		var actNumaction = $('#actNumaction').val();
		var libaction = $('#libaction').val();
		var scoremin = $('#scoremin').val();

		var model = new actionModel();
		if (this.idAction===undefined){
			model.save({"actNumaction":actNumaction, "libaction":libaction, "scoremin":scoremin}, {
				success: this.showModal("Ajout"),
				error: this.showErrorModal
			});
		}
		else{
			model.save({"id":this.idAction, "actNumaction":actNumaction, "libaction":libaction, "scoremin":scoremin}, {
				success: this.showModal("Modifier"),
				error: this.showErrorModal
			});
		} 
		return true;
	},

	renderResultat: function(responseList, response){
		if(response===undefined){
			this.$content.html(template({actions:responseList[0]}));
		}else{

			// Enleve l'id courrant de la liste
			for(var i = 0; i <responseList[0].length; i++) {
	      		if(responseList[0][i].numaction === response[0].numaction) {
			         responseList[0].splice(i, 1);
			    }
		  	}
			this.$content.html(template({action: response[0], actions:responseList[0]}));
			$("#actNumaction option[value='"+response[0].actNumaction+"']").attr("selected", "selected");
		}
		$('#formPutAction').submit(_.bind(function(event){
		    this.valid();
		}, this));
	},

	showModal: function(actionType){
		var ArticleModalBody = "La";
		if(actionType === "Ajout"){
			ArticleModalBody = "L'";
		}
		var modalView = new modal({
			modalTitle: actionType,
		 	modalBody: ArticleModalBody+" "+actionType+" a été effectué avec succès"
		});
		
		Backbone.history.navigate('#Actions', {trigger:true});
	},

	showErrorModal: function(error){
		var modalView = new modal({
			modalTitle: "Ajout/Modifier",
		 	modalBody: "Erreur lors de l'ajout/modification : " + error,
		 	modalError: true
		});
	}
});

module.exports = view;