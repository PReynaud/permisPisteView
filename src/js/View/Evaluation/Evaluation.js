var choixModel = require('../../Model/Evaluation/Evaluation');
var jeuxModel = require('../../Model/Jeux/JeuxList');
var template = require('./Evaluation.hbs');
var templateEvalMission = require('./EvalMission.hbs');
var templateBilanMission = require('./BilanMission.hbs');
var templateBilanFinal = require('./BilanFinal.hbs');

var mission = require('../../Model/Missions/Mission');
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
			.done(_.bind(this.requestActions, this));
	},

	requestActions: function(response){
		this.listObjectif = response;
		var tempList = new objectifList();
		for(var i=0;i<response.length;i++){
			var tempObjectifModel = new objectifModel({
					libobjectif: response[i][2].libobjectif,
					numobjectif: response[i][2].numobjectif
			});
			tempList.add(tempObjectifModel);
		}
		this.listObjectif = tempList;

		var promiseTab = [];
		this.actionRequestList = new actionList();
		for(var i=0;i<this.listObjectif.length; i++){
			var tempAction = new actionModel();
			tempAction.url = tempList.url + this.listObjectif.at(i).get("numobjectif") + "/Action";
			promiseTab[promiseTab.length] = tempAction.fetch();
		}

		$.whenall = function(arr) { return $.when.apply($, arr); };

		$.whenall(promiseTab).then(_.bind(function(response){
			for(var j = 0; j < response.length; j++){
				/* On récupère toutes les règles de l'action en cours */
				var tempAction = new actionModel({
							numaction: response[0][j][1].numaction,
							scoremin:  response[0][j][1].scoremin,
							libaction: response[0][j][1].libaction,
							numobjectif: response[0][j][0].numobjectif
						});
				/*Ajout de l'action à la liste d'action*/
				this.actionRequestList.add(tempAction);
			}
			return this;
		}, this))
		.done(_.bind(function(){
			this.requestRegles();
		}, this));
	},

	requestRegles: function(){
		this.regleRequestList = new regleList();
		var promiseArray = [];
		for(var i = 0; i < this.actionRequestList.length; i++){
			var tempRegleModel = new regleModel();
			tempRegleModel.urlRoot = tempRegleModel.urlRoot + "Action/" + this.actionRequestList.at(i).get("numaction");
			promiseArray[promiseArray.length] = tempRegleModel.fetch();
		}
		$.whenall(promiseArray).then(_.bind(function(response){
			var responseArray = response[0];
			for(var j = 0; j < responseArray.length; j++){
				var tempRegleModel = new regleModel({
					libregle: responseArray[j][0].libregle,
					numregle: responseArray[j][0].numregle,
					scoremin: responseArray[j][0].scoremin,
					numaction: responseArray[j][1].numaction
				});
				this.regleRequestList.add(tempRegleModel);
			}
		}, this))
		.done(_.bind(function(){
			this.joinDatas();
		}, this));
	},

	joinDatas : function(){
		for(var i = 0; i < this.actionRequestList.length; i++){
			var listRegle = [];
			for (var j = 0; j<this.regleRequestList.length;j++) {
				if(this.actionRequestList.at(i).get("numaction")==this.regleRequestList.at(j).get("numaction")){
					listRegle.push(this.regleRequestList.at(j));
				}
			}
			this.actionRequestList.at(i).set("listRegle",listRegle);
		}

		for(var i = 0; i < this.listObjectif.length; i++){
			var listAction = [];
			for (var j = 0; j<this.actionRequestList.length;j++) {
				if(this.listObjectif.at(i).get("numobjectif")==this.actionRequestList.at(j).get("numobjectif")){
					listAction.push(this.actionRequestList.at(j));
				}
			}
			this.listObjectif.at(i).set("listAction",listAction);
		}
		var temp = this.selectedJeu.missionJeu[this.currentMission];
		var actualMission = new mission({
			nummission: temp.nummission,
			numjeu: temp.numjeu,
			libmission: temp.libmission
		}); 
		actualMission.set("listObjectif", this.listObjectif);

		$(this.content).html(templateEvalMission({mission:actualMission}));
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
				this.currentMission=this.currentMission+1;
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