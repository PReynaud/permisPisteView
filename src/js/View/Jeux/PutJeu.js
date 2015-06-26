var jeuModel = require('../../Model/Jeux/Jeu');
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
		$.when(new jeuModel().fetch())
		.done(_.bind(function(jeu){
			this.renderResultat(jeu);
		},this));
		this.$pageName.html("Ajout Jeu");
		this.$title.html("Ajouter un Jeu");
	},

	renderModif: function(id){
		$.when(new jeuModel({"id":id}).fetch())
		.done(_.bind(function(jeu){
			this.renderResultat(jeu);
		},this));		
		this.$pageName.html("Modifier Jeu");
		this.$title.html("Modifier un Jeu");
		this.idJeu=id;
	},
	valid: function(e){
		var libellejeu = $('#libellejeu').val();
		var model = new jeuModel();
		missionList.add([mission]);
		if (this.idJeu===undefined){
			model.save({"libellejeu":libellejeu}, {
				success: this.showModal("Ajout"),
				error: this.showErrorModal
			});
		}
		else{
			model.save({"id":this.idJeu, "libellejeu":libellejeu}, {
				success: this.showModal("Modifier"),
				error: this.showErrorModal
			});
		} 
		return true;
	},

	renderResultat: function(response){
		if(response===undefined){
			this.$content.html(template());
		}else{
			this.$content.html(template({jeu:response}));
		}
		$('#formPutJeu').submit(_.bind(function(event){
		    this.valid();
		}, this));
	},

	showModal: function(jeuType){
		var ArticleModalBody = "La";
		if(jeuType === "Ajout"){
			ArticleModalBody = "L'";
		}
		var modalView = new modal({
			modalTitle: jeuType,
		 	modalBody: ArticleModalBody+" "+jeuType+" a été effectué avec succès"
		});
		
		Backbone.history.navigate('#Jeux', {trigger:true});
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