var config = require('../../configuration.js');

var FixeModel = Backbone.Model.extend({
	urlRoot: config.url + 'Fixe/'
});

module.exports = FixeModel;