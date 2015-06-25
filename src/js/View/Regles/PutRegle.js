var regleModel = require('../../Model/Regles/Regle');
var template = require('./PutRegle.hbs');
var modal = require('../Global/modalView.js');
var config = require('../../configuration.js');

var view = Backbone.View.extend({
	$pageName : $('title'),
	$title : $('#title'),	
	$content : $('#content'),

	el: $('#formPutRegle'),

	//Appelé au moment de l'instanciation	
	initialize: function(){
	},

	//Fonction chargée du rendu
	render: function(){
		$.when()
		.done(_.bind(function(regle){
			this.renderResultat();
		},this));
		this.$pageName.html("Ajout Regle");
		this.$title.html("Ajouter une Regle");
	},

	renderModif: function(id){
		this.idRegle=id;
		$.when(new regleModel({"id":id}).fetch())
		.done(_.bind(function(regle){
			this.renderResultat(regle);
		},this));		
		this.$pageName.html("Modifier Regle");
		this.$title.html("Modifier une Regle");
	},

	valid: function(e){
		var libRegle = $('#libRegle').val();
		var scoreAction = $('#scoreAction').val();

		var model = new regleModel();
		if (this.idRegle===undefined){
			model.save({"libregle":libRegle, "scoremin":scoreAction}, {
				success: new modal().showModal("Ajout","#Regles"),
				error: new modal().showErrorModal
			}); 
		}
		else{
			model.save({"id":this.idRegle, "libregle":libRegle, "scoremin":scoreAction}, {
				success: new modal().showModal("Modifier","#Regles"),
				error: new modal().showErrorModal
			});
		} 
		return true;
	},

	renderResultat: function(regle){
		if(regle===undefined){
			this.$content.html(template());
		}else{
			this.$content.html(template({regle:regle}));
		}
		$('#formPutRegle').submit(_.bind(function(event){
		    this.valid();
		}, this));
	}
});

module.exports = view;