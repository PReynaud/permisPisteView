var config = require('../../configuration.js');

var Est_associeModel = Backbone.Model.extend({
	urlRoot: config.url + 'EstAssocie/'
});

module.exports = Est_associeModel;