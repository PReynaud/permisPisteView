var config = require('../../configuration.js');
var MissionsModel = require('./Mission');

var MissionsCollection = Backbone.Collection.extend({
	model: MissionsModel,
	url: config.url + 'Mission/'
});

 module.exports = MissionsCollection;