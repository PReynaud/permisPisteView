var ApprentisModel = Backbone.Model.extend({
	urlRoot: 'http://localhost:8080/Apprenant/'
});

 var ApprentisCollection = Backbone.Collection.extend({
	model: ApprentisModel,
	url: 'http://localhost:8080/Apprenant/'
});

 module.exports = ApprentisCollection;