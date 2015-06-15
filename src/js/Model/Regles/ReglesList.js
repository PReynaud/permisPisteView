var config = require('../../configuration.js');
var ReglesModel = require('./Regle');

var ReglesCollection = Backbone.Collection.extend({
	model: ReglesModel,
	url: config.url + 'Regle/'
});

 module.exports = ReglesCollection;