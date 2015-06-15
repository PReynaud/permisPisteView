var config = require('../../configuration.js');

var JeuxModel = Backbone.Model.extend({
	urlRoot: config.url + 'Jeu/'
});
module.exports = JeuxModel;