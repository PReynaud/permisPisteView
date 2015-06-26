var config = require('../../configuration.js');
var ObjectifsModel = require('./Objectif');

var ObjectifMissionCollection = Backbone.Collection.extend({
	model: ObjectifsModel,
	url: config.url
});
module.exports = ObjectifMissionCollection;