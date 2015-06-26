var choixModel = require('../../Model/Evaluation/Evaluation');
var jeuxModel = require('../../Model/Jeux/JeuxList');
var template = require('./Evaluation.hbs');
var templateEvalMission = require('./EvalMission.hbs');
var templateBilanMission = require('./BilanMission.hbs');
var templateBilanFinal = require('./BilanFinal.hbs');

var view = Backbone.View.extend({
	pageName : $('title'),
	title : $('#title'),
	content : $('#content'),

	//Appelé au moment de l'instanciation	
	initialize: function(){
	},

	//Fonction chargée du rendu
	render: function(id){
		this.model = new choixModel();
		$(this.pageName).html("Evaluation");
		$(this.title).html("Evaluation");

		this.jeux = new jeuxModel().fetch({
			success: _.bind(this.renderResultat, this)
		});
	},

	/* Render de la sélection d'un jeu */ 
	renderResultat: function(response){
		$(this.content).html(template({jeux: response.toArray()}));

		var $formChoixJeu = $('#formChoixJeu');
		$formChoixJeu.submit(_.bind(function(event){
		    this.valid();
		}, this));
	},

	/* Clic sur le premier bouton valider */
	valid: function(e){
		$(this.content).html(templateEvalMission());

		var formChoixRegle = $('#formChoixRegle');
		formChoixRegle.submit(_.bind(function(event){
		    this.validMission();
		}, this));
	},

	/* Clic sur le second bouton valider */ 
	validMission: function(e){
		$(this.content).html(templateBilanMission());

		var $missionSuivante = $('#missionSuivante');
		$missionSuivante.click(_.bind(function(event){
		    this.validBilan();
		}, this));
	},


	/* Lorsque toutes les missions ont été validées */ 
	validBilan: function(e){
		$(this.content).html(templateBilanFinal());
	}
});

module.exports = view;