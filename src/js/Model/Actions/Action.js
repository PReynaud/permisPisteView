var config = require('../../configuration.js');

var ActionsModel = Backbone.Model.extend({
	urlRoot: config.url + 'Action/'
});
module.exports = ActionsModel;