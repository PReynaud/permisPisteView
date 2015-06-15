var config = require('../../configuration.js');

var ApprenantsModel = Backbone.Model.extend({
	urlRoot: config.url + 'Apprenant/'
});

module.exports = ApprenantsModel;