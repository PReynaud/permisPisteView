var config = require('../../configuration.js');
var ApprenantsModel = require('./Apprenant');

var ApprenantsCollection = Backbone.Collection.extend({
	model: ApprenantsModel,
	url: config.url + 'Apprenant/'
});

 module.exports = ApprenantsCollection;