var config = require('../../configuration.js');
var JeuxModel = require('./Jeu');

var JeuxCollection = Backbone.Collection.extend({
	model: JeuxModel,
	url: config.url + 'Jeu/'
});

 module.exports = JeuxCollection;