var missionModel = require('../../Model/Missions/Mission');
var template = require('./PutMission.hbs');
var modal = require('../Global/modal.js');

var view = Backbone.View.extend({
	$pageName : $('title'),
	$title : $('#title'),	
	$content : $('#content'),

	el: $('#formPutMission'),

	//Appelé au moment de l'instanciation	
	initialize: function(){
	},

	//Fonction chargée du rendu
	render: function(idJeu){
		this.renderResultat();
		this.$pageName.html("Ajout mission");
		this.$title.html("Ajouter un mission");
		this.idJeu=idJeu;
	},

	renderModif: function(id,idJeu){
		$.when(new missionModel({"id":idJeu}).fetch())
		.done(_.bind(function(mission){
			this.renderResultat(mission);
		},this));		
		this.$pageName.html("Modifier mission");
		this.$title.html("Modifier un mission");
		this.idMission=id;
		this.idJeu=idJeu;
	},
	valid: function(e){
		var libmission = $('#libmission').val();
		var model = new missionModel();
		if (this.idMission===undefined){
			model.save({"numjeu":this.idJeu,"libmission":libmission}, {
				success: this.showModal("Ajout"),
				error: _.bind(this.showErrorModal,this)
			});
		}
		else{
			model.save({"id":this.idMission,"numjeu":this.idJeu, "libmission":libmission}, {
				success: this.showModal("Modifier"),
				error: _.bind(this.showErrorModal,this)
			});
		} 
		return true;
	},

	renderResultat: function(response){
		if(response===undefined){
			this.$content.html(template());
		}else{
			this.$content.html(template({mission:response}));
		}
		$('#formPutMission').submit(_.bind(function(event){
		    this.valid();
		}, this));
	},

	showModal: function(missionType){
		var ArticleModalBody = "La";
		if(missionType === "Ajout"){
			ArticleModalBody = "L'";
		}
		var modalView = new modal({
			modalTitle: missionType,
		 	modalBody: ArticleModalBody+" "+missionType+" a été effectué avec succès"
		});
		
		Backbone.history.navigate('#Jeux', {trigger:true});
		window.location.reload();
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