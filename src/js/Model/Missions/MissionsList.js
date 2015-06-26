var config = require('../../configuration.js');

var MissionsCollection = Backbone.Collection.extend({
	model: MissionsModel,
	url: config.url + 'Mission/'
});

 module.exports = MissionsCollection;