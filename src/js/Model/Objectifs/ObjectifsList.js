var config = require('../../configuration.js');
var ObjectifsModel = require('./Objectif');

var ObjectifsCollection = Backbone.Collection.extend({
	model: ObjectifsModel,
	url: config.url + 'Objectif/'
});

 module.exports = ObjectifsCollection;