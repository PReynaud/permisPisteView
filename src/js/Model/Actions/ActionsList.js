var config = require('../../configuration.js');
var ActionsModel = require('./Action');

var ActionsCollection = Backbone.Collection.extend({
	model: ActionsModel,
	url: config.url + 'Action/'
});

 module.exports = ActionsCollection;