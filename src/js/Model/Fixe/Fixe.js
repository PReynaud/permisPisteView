var config = require('../../configuration.js');

var FixeModel = Backbone.Model.extend({
	urlRoot: config.url + 'Mission/'
});

module.exports = FixeModel;