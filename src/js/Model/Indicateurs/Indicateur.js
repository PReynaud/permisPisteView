var config = require('../../configuration.js');

var IndicateursModel = Backbone.Model.extend({
	urlRoot: config.url + 'Indicateur/'
});
module.exports = IndicateursModel;