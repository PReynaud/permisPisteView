var objectifModel = require('../../Model/Objectifs/Objectif');
var objectifsModel = require('../../Model/Objectifs/ObjectifsList');
var objectifList= require('../../Model/Fixe/Fixe');
var FixeModel = require('../../Model/Fixe/Fixe2');
var template = require('./LieObjectif.hbs');
var modal = require('../Global/modal.js');

var view = Backbone.View.extend({
	$pageName : $('title'),
	$title : $('#title'),	
	$content : $('#content'),

	el: $('#formLieObjectif'),

	//Appelé au moment de l'instanciation	
	initialize: function(){
	},

	//Fonction chargée du rendu
	render: function(idJeu,idMission){
		var objectifsParser=new objectifList();
		objectifsParser.urlRoot=objectifsParser.urlRoot+''+idMission+"/Objectif";
		$.when(new objectifModel().fetch(),new objectifsModel().fetch(),objectifsParser.fetch())
		.done(_.bind(function(fixe,objectifs,objectifsParser){
			this.renderResultat(fixe,objectifs,objectifsParser);
		},this));
		this.$pageName.html("Lie Objectif");
		this.$title.html("Lier un Objectif");
		this.idMission=idMission;
		this.idJeu=idJeu;
	},

	valid: function(e){
		var numobjectif = $('#objectif').val();
		var model = new FixeModel();
		model.save({"nummission":this.idMission, "numobjectif":numobjectif}, {
			success: this.showModal,
			error: this.showErrorModal
		});
		return true;
	},

	renderResultat: function(fixe,objectifs,objectifsParser){
		if(objectifsParser===null){
			this.$content.html(template({objectifs:objectifs}));
		}else{
			var Objectif = Backbone.Model.extend({
				numobjectif:0,
				libobjectif:""
	  		});
			var CollectionObjectif = Backbone.Collection.extend({
			  model: Objectif
			});
			var listObjectif = new CollectionObjectif();
			// Enleve l'id les ids deja selectionnes de la liste
			for(var i = 0; i <objectifs[0].length; i++) {
				objectif=new Objectif();
				objectif.numobjectif=objectifs[0][i].numobjectif;
				objectif.libobjectif=objectifs[0][i].libobjectif;
				listObjectif.add([objectif]);
				for(var j = 0; j <objectifsParser[0].length; j++) {
		      		if(this.idMission == objectifsParser[0][j][0].nummission) {
		      			if(objectifs[0][i].numobjectif == objectifsParser[0][j][0].numobjectif)
		      			{
		      				listObjectif.remove([objectif]);
		      			}
				    }
				}
		  	}
			// Passe les elments au hbs
				this.$content.html(template({Objectifstot:listObjectif.models}));
			}

		$('#formLieObjectif').submit(_.bind(function(event){
		    this.valid();
		}, this));
	},

	showModal: function(){
		var modalView = new modal({
			modalTitle: "Ajout",
		 	modalBody: "L'ajout a été effectué avec succès"
		});
		
		Backbone.history.navigate('#Jeux/'+this.idJeu+'/Missions/'+this.idMission, {trigger:true});
	},

	showErrorModal: function(object,error){
		if (error.status==201){
			showModal();
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