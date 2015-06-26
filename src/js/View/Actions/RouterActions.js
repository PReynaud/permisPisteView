var Actions = require('./Actions');
var Action = require('./Action');
var PutAction = require('./PutAction');
var DeleteAction = require('./DeleteAction');

var Router = Backbone.Router.extend({
	routes: {
		"Actions": "Actions",
		"Actions/Ajout": "AjoutAction",
		"Actions/Modifier/:id": "ModifAction",
		"Actions/Supprimer/:id": "SupprAction",
		"Actions/:id": "Action",
		"Actions/Modifier/:id/Regle/Supprimer/:idRegle": "SupprActionRegle",
	},

	initialize: function(){

	},

	Actions: function(){
		this.actions = new Actions();
		this.actions.render();
	},

	Action: function(id){
		this.actions = new Action();
		this.actions.render(id);
	},

	AjoutAction: function(){
		this._action = new PutAction();
		this._action.render();
	},

	ModifAction: function(id){
		this._action = new PutAction();
		this._action.renderModif(id);
	},

	SupprAction: function(id){
		this._action = new DeleteAction();
		this._action.render(id);
	},

	SupprActionRegle: function(id, idRegle){
		this._action = new DeleteAction();
		this._action.renderPossede(id,idRegle);
	}
});

module.exports = Router;