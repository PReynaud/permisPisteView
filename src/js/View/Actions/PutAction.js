var actionModel = require('../../Model/Actions/Action');
var actionsModel = require('../../Model/Actions/ActionsList');
var reglesModel = require('../../Model/Regles/ReglesList');
var regleModel = require('../../Model/Regles/Regle');
var possedeModel = require('../../Model/Possede/Possede');
var template = require('./PutAction.hbs');
var modal = require('../Global/modal.js');

var view = Backbone.View.extend({
	$pageName : $('title'),
	$title : $('#title'),	
	$content : $('#content'),

	el: $('#formPutAction'),

	//Appelé au moment de l'instanciation	
	initialize: function(){
	},

	//Fonction chargée du rendu
	render: function(){
		$.when(new actionsModel().fetch())
		.done(_.bind(function(actions){
			this.renderResultat(actions);
		},this));
		this.$pageName.html("Ajout Action");
		this.$title.html("Ajouter une Action");
	},

	renderModif: function(id){
		var modelRegles = new reglesModel();
		var model = new regleModel();
		model.url = model.urlRoot+'/Action/'+id;
		
		$.when(new actionsModel().fetch(),modelRegles.fetch(),model.fetch(),new actionModel({"id":id}).fetch())
		.done(_.bind(function(actions,reglesTot,regles,action){
			this.renderResultat(actions,reglesTot,regles,action);
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

	validRegle: function(e){
		var numregle = $('#numregle').val();
		var model =  new possedeModel();
		model.save({"numaction":this.idAction, "numregle":numregle}, {
			success: this.showModal,
			error: this.showErrorModal
		});
		return true;
	},

	renderResultat: function(responseList, responseListRegleTot, responseListRegle, response){
		if(response===undefined){
			this.$content.html(template({actions:responseList}));
		}else{

			// Enleve l'id courrant de la liste
			for(var i = 0; i <responseList[0].length; i++) {
	      		if(responseList[0][i].numaction === response[0].numaction) {
			         responseList[0].splice(i, 1);
			    }
		  	}

		  	// Refactoring list des règle pour que ça soit plus lisible
			var Regle = Backbone.Model.extend({
		  	});
			var CollectionRegle = Backbone.Collection.extend({
			  model: Regle
			});
			var count = 0;
			var listRegle = new CollectionRegle();
			for (var i = 0; i <  responseListRegle[0].length; i++) {
				var regle = new Regle(responseListRegle[0][i][0]);
				listRegle.add([regle]);
				count++;
			}
			console.log(responseListRegleTot[0]);
			this.$content.html(template({action: response[0], actions: responseList[0],regles: listRegle.models,reglesTot: responseListRegleTot[0]}));
			$("#actNumaction option[value='"+response[0].actNumaction+"']").attr("selected", "selected");
		}
		$('#formPutAction').submit(_.bind(function(event){
		    this.valid();
		}, this));

		$('#formPutRegle').submit(_.bind(function(event){
		    this.validRegle();
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