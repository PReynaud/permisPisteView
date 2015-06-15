var config = require('../../configuration.js');
var IndicateursModel = require('./Indicateur');

var IndicateursCollection = Backbone.Collection.extend({
	model: IndicateursModel,
	url: config.url + 'Indicateur/'
});

 module.exports = IndicateursCollection;