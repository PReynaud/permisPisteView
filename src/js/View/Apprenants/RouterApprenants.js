var Apprenants = require('./Apprenants');
var Apprenant = require('./Apprenant');
var PutApprenant = require('./PutApprenant');
var DeleteApprenant = require('./DeleteApprenant');

var Router = Backbone.Router.extend({
	routes: {
		"Apprenants": "Apprenants",
		"Apprenants/Ajout": "AjoutApprenant",
		"Apprenants/Modifier/:id": "ModifApprenant",
		"Apprenants/Supprimer/:id": "SupprApprenant",
		"Apprenants/:id": "Apprenant",
	},

	initialize: function(){

	},

	Apprenants: function(){
		this.Apprenants = new Apprenants();
		this.Apprenants.render();
	},

	Apprenant: function(id){
		this.Apprenant = new Apprenant();
		this.Apprenant.render(id);
	},

	AjoutApprenant: function(){
		this.Apprenant = new PutApprenant();
		this.Apprenant.render();
	},

	ModifApprenant: function(id){
		this.Apprenant = new PutApprenant();
		this.Apprenant.renderModif(id);
	},

	SupprApprenant: function(id){
		this.Apprenant = new DeleteApprenant();
		this.Apprenant.render(id);
	}
});

module.exports = Router;