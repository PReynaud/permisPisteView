var ReglesModel = require('./Regle');

var ReglesCollection = Backbone.Collection.extend({
	model: ReglesModel,
	url: 'http://localhost:8080/Regle/'
});

 module.exports = ReglesCollection;