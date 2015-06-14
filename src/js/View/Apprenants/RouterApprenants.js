var Apprenants = require('./Apprenants');
var Apprenant = require('./Apprenant');

var Router = Backbone.Router.extend({
	routes: {
		"Apprenants": "Apprenants",
		"Apprenants/:id": "Apprenant"
	},

	initialize: function(){

	},

	Apprenants: function(){
		this.apprenants = new Apprenants();
		this.apprenants.render();
	},

	Apprenant: function(id){
		this.apprenant = new Apprenant();
		this.apprenant.render(id);
	}
});

module.exports = Router;