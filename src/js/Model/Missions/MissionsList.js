var config = require('../../configuration.js');
var MissionsModel = require('./Mission');

var MissionsCollection = Backbone.PersistableCollection.extend({
	model: MissionsModel,
	url: config.url + 'Mission/'
});

 module.exports = MissionsCollection;