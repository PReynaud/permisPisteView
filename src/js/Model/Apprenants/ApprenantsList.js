var ApprenantsModel = require('./Apprenant');

var ApprenantsCollection = Backbone.Collection.extend({
	model: ApprenantsModel,
	url: 'http://localhost:8080/Apprenant/'
});

 module.exports = ApprenantsCollection;