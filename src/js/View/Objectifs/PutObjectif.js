var objectifModel = require('../../Model/Objectifs/Objectif');
var objectifsModel = require('../../Model/Objectifs/ObjectifsList');
var template = require('./PutObjectif.hbs');
var modal = require('../Global/modal.js');

var view = Backbone.View.extend({
	$pageName : $('title'),
	$title : $('#title'),	
	$content : $('#content'),

	el: $('#formPutObjectif'),

	//Appelé au moment de l'instanciation	
	initialize: function(){
	},

	//Fonction chargée du rendu
	render: function(){
		$.when(null,new objectifsModel().fetch())
		.done(_.bind(function(objectif, objectifs){
			this.renderResultat(null,objectifs);
		},this));
		this.$pageName.html("Ajout Objectif");
		this.$title.html("Ajouter un Objectif");
	},

	renderModif: function(id){
		$.when(new objectifModel({"id":id}).fetch(),new objectifsModel().fetch())
		.done(_.bind(function(objectif, objectifs){
			this.renderResultat(objectif,objectifs);
		},this));		
		this.$pageName.html("Modifier Objectif");
		this.$title.html("Modifier un Objectif");
		this.idObjectif=id;
	},

	valid: function(e){
		var libobjectif = $('#libobjectif').val();

		var model = new objectifModel();
		if (this.idObjectif===undefined){
			model.save({"libobjectif":libobjectif}, {
				success: this.showModal,
				error: this.showErrorModal
			});
		}
		else{
			model.save({"id":this.idObjectif, "libobjectif":libobjectif}, {
				success: this.showModal,
				error: this.showErrorModal
			});
		} 
		return true;
	},

	renderResultat: function(response,responseList){
		if(response === null){
			this.$content.html(template({objectifs:responseList[0]}));
		}else{

			// Enleve l'id courrant de la liste
			for(var i = 0; i <responseList[0].length; i++) {
	      		if(responseList[0][i].numobjectif === response[0].numobjectif) {
			         responseList[0].splice(i, 1);
			    }
		  	}
			this.$content.html(template({objectif: response[0], objectifs:responseList[0]}));
			//$("#actNumobjectif option[value='"+response[0].actNumobjectif+"']").attr("selected", "selected");
		}
		$('#formPutObjectif').submit(_.bind(function(event){
		    this.valid();
		}, this));
	},

	showModal: function(){
		var modalView = new modal({
			modalTitle: "Ajout",
		 	modalBody: "L'ajout a été effectué avec succès"
		});
		
		Backbone.history.navigate('#Objectifs', {trigger:true});
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