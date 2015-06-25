var actionModel = require('../../Model/Actions/Action');
var actionsModel = require('../../Model/Actions/ActionsList');
var template = require('./PutAction.hbs');
var modal = require('../Global/modalView.js');

var view = Backbone.View.extend({
	$pageName : $('title'),
	$title : $('#title'),	
	$content : $('#content'),

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
		$.when(new actionsModel().fetch(),new actionModel({"id":id}).fetch())
		.done(_.bind(function(actions,action){
			this.renderResultat(actions,action);
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
				success: new modal().showModal("Ajout", "#Actions"),
				error: new modal().showErrorModal
			});
		}
		else{
			model.save({"id":this.idAction, "actNumaction":actNumaction, "libaction":libaction, "scoremin":scoremin}, {
				success: new modal().showModal("Modifier", "#Actions"),
				error: new modal().showErrorModal
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
	}
});

module.exports = view;