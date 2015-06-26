var config = require('../../configuration.js');

var PossedeModel = Backbone.Model.extend({
	urlRoot: config.url + 'Possede/'
});

module.exports = PossedeModel;