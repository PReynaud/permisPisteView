var Actions = require('./Actions');
var Action = require('./Action');
var AjoutAction = require('./AjoutAction');

var Router = Backbone.Router.extend({
	routes: {
		"Actions": "Actions",
		"Actions/Ajout": "AjoutAction",
		"Actions/Modifier/:id": "ModifAction",
		"Actions/:id": "Action"
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
		this._action = new AjoutAction();
		this._action.render();
	},

	ModifAction: function(id){
		this._action = new AjoutAction();
		this._action.renderModif(id);
	}
});

module.exports = Router;