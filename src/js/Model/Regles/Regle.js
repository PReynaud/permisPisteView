var config = require('../../configuration.js');

var ReglesModel = Backbone.Model.extend({
	urlRoot: config.url + 'Regle/'/*,
	url: config.url + 'Regle/'*/
});
module.exports = ReglesModel;