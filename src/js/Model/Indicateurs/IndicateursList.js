var IndicateursModel = require('./Indicateur');

var IndicateursCollection = Backbone.Collection.extend({
	model: IndicateursModel,
	url: 'http://localhost:8080/Indicateur/'
});

 module.exports = IndicateursCollection;