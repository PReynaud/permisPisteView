var config = require('../../configuration.js');

var ObjectifsModel = Backbone.Model.extend({
	urlRoot: config.url + 'Objectif/'
});
module.exports = ObjectifsModel;