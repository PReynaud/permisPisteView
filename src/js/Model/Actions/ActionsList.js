var ActionsModel = require('./Action');

var ActionsCollection = Backbone.Collection.extend({
	model: ActionsModel,
	url: 'http://localhost:8080/Action/'
});

 module.exports = ActionsCollection;