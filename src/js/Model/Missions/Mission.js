var config = require('../../configuration.js');

var MissionsModel = Backbone.Model.extend({
	urlRoot: config.url+ 'Mission/'
});
module.exports = MissionsModel;