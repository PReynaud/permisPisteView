var choixModel = require('../../Model/Evaluation/Evaluation');
var jeuxModel = require('../../Model/Jeux/JeuxList');
var template = require('./Evaluation.hbs');
var templateEvalMission = require('./EvalMission.hbs');
var templateBilanMission = require('./BilanMission.hbs');
var templateBilanFinal = require('./BilanFinal.hbs');

var missionObjectifCollection = require('../../Model/Objectifs/ObjectifMission');
var objectifModel = require('../../Model/Objectifs/Objectif');
var objectifList = require('../../Model/Objectifs/ObjectifsList');

var actionModel = require('../../Model/Actions/Action');
var actionList = require('../../Model/Actions/ActionsList');

var regleModel = require('../../Model/Regles/Regle');
var regleList = require('../../Model/Regles/ReglesList');

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
		this.jeuResponse = response.toArray();

		var $formChoixJeu = $('#formChoixJeu');
		$formChoixJeu.submit(_.bind(function(event){
		    this.valid();
		}, this));
	},

	/* Clic sur le premier bouton valider */
	valid: function(e){
		var choixJeu = $('#choixJeu').val();

		for(var i = 0; i < this.jeuResponse.length; i++){
			if(this.jeuResponse[i].attributes.numjeu == choixJeu){				
				this.selectedJeu = this.jeuResponse[i].attributes;
			}
		}
		this.currentMission = 0;
		this.numberOfMission = this.selectedJeu.missionJeu.length;

		this.renderOneMission();
	},

	/* Fais le rendu de la page pour une mission */ 
	renderOneMission: function(){
		/*
			Trois requêtes à faire:
			_ entre objectif et mission
			_ entre chaque mission et actions
			_ entre chaque action et règles 
		 */

		var missionObjectif = new missionObjectifCollection();
		var urlObjectifMission = missionObjectif.url + "/Mission/" + (this.currentMission + 1) + "/Objectif";
		missionObjectif.url = urlObjectifMission;

		$.when(missionObjectif.fetch())
			.then(_.bind(function(list, response){	
				this.tempListObjectif = new objectifList();

				/* On récupère toutes les objectifs de la mission et on la passe dans la collection backbone*/ 
				for(var i = 0; i< list.length; i++){
					var tempObjectif = new objectifModel({
							libobjectif: list[i][2].libobjectif, numobjectif: list[i][2].numobjectif
						});
					this.tempListObjectif.add(tempObjectif);
				}

				/* On récupère toutes les actions de nos objectifs */
				for(var i = 0; i < this.tempListObjectif.length; i++){
					var tempObjectif2 = this.tempListObjectif.at(i);
					tempObjectif2.url = tempObjectif2.urlRoot + tempObjectif2.get("numobjectif") + "/Action";

					$.when(tempObjectif2.fetch())
						.then(_.bind(function(objectif,actions){
							var tempActionList = new actionList();
							for(var j = 0; j < objectif.length; j++){
								/* On récupère toutes les règles de l'action en cours */
								var tempAction = new actionModel({
											numaction: objectif[j][1].numaction,
											scoremin:  objectif[j][1].scoremin,
											libaction: objectif[j][1].libaction
										});
								/*Ajout de l'action à la liste d'action*/
								tempActionList.add(tempAction);
								var tempRegleList = new regleList();
								tempRegleList.url = tempRegleList.url + "Action/" + objectif[j][1].numaction;
								$.when(tempRegleList.fetch())									
									.done(_.bind(function(regles){
										for(var l=0; l<tempActionList.length;l++){
											if (tempActionList.models[l].get("numaction")==regles[0][1].numaction){
												tempActionList.models[l].set("regleList",regles);
												if (l==tempActionList.length){
													debugger;
													$(this.content).html(templateEvalMission({titre: this.selectedJeu.libellejeu}));
												}
												break;
											}
										}
										
									}),this);
							}

							for(var k = 0; k < this.tempListObjectif.length; k++){
								if(this.tempListObjectif.at(k).get("numobjectif") == objectif[k][0].numobjectif){
									this.tempListObjectif.at(k).set("listActions", tempActionList);
								}
							}							
						}, this));
				}
			}))

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
			if(this.currentMission >= this.numberOfMission){
		    	this.validBilan();
			}
			else{
				this.renderOneMission();
			}
		}, this));
	},


	/* Lorsque toutes les missions ont été validées */ 
	validBilan: function(e){
		$(this.content).html(templateBilanFinal());
	}
});

module.exports = view;