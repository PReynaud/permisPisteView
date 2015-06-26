var objectifModel = require('../../Model/Objectifs/Objectif');
var objectifsModel = require('../../Model/Objectifs/ObjectifsList');
var actionModel = require('../../Model/Actions/ActionsList');
var Est_associeModel = require('../../Model/Est_associe/Est_associe');
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
		$.when(new actionModel().fetch(),null,null)
		.done(_.bind(function(actions,objectif,acionObjectif){
			this.renderResultat(actions,null,null);
		},this));
		this.$pageName.html("Ajout Objectif");
		this.$title.html("Ajouter un Objectif");
	},

	renderModif: function(id){
		var model = new objectifModel();
		model.url = model.urlRoot+''+id+"/Action";

		$.when(new actionModel().fetch(),new objectifModel({"id":id}).fetch(),model.fetch())
		.done(_.bind(function(actions,objectif,acionObjectif){
			this.renderResultat(actions,objectif,acionObjectif);
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

	validAction: function(e){
		var numaction = $('#numaction').val();

		var model =  new Est_associeModel();
		model.save({"numobjectif":this.idObjectif, "numaction":numaction}, {
			success: this.showModal,
			error: this.showErrorModal
		});
		return true;
	},

	renderResultat: function(responseActionListTot,response,responseActionList){
		if(this.idObjectif===undefined){
			this.$content.html(template({actionsTot:responseActionListTot[0]}));
		}else{

			// Enleve l'id les ids deja selectionnes de la liste
			for(var i = 0; i <responseActionListTot[0].length; i++) {
				for(var j = 0; j <responseActionList[0].length; j++) {
		      		if(responseActionListTot[0][i].numaction === responseActionList[0].numaction) {
				         responseActionListTot[0].splice(i, 1);
				    }
				}
		  	}

		  	// Recuperer une liste d'action de l'objectif plus lisible
		  	var Action = Backbone.Model.extend({
	  		});
			var CollectionAction = Backbone.Collection.extend({
			  model: Action
			});
			var count = 0;
			var listAction = new CollectionAction();
			for (var i = 0; i <  responseActionList[0].length; i++) {
				var action = new Action(responseActionList[0][i][1]);
				listAction.add([action]);
				count++;
			}
						
			// Passe les elments au hbs
			if(count !==0 ){
				this.$content.html(template({objectif: response[0],actionsTot:responseActionListTot[0],actions:listAction.models}));
			}else{
				this.$content.html(template({objectif: response[0],actionsTot:responseActionListTot[0]}));
			}
		}

		$('#formPutObjectif').submit(_.bind(function(event){
		    this.valid();
		}, this));

		$('#formPutAction').submit(_.bind(function(event){
		    this.validAction();
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