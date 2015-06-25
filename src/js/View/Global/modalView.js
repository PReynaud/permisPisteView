var modal = require('../Global/modal.js');

var view = Backbone.View.extend({
	showModal: function(actionType, url){
        var ArticleModalBody = "La";
        if(actionType === "Ajout"){
            ArticleModalBody = "L'";
        }
        var modalView = new modal({
            modalTitle: actionType,
            modalBody: ArticleModalBody+" "+actionType+" a été effectué avec succès"
        });
        
        Backbone.history.navigate(url, {trigger:true});
    },

    showErrorModal: function(object,error){
        var modalView = new modal({
            modalTitle: "Erreur "+error.status+" Ajout/Modification",
            modalBody: "Erreur lors de l'ajout/modification de "+ object.attributes.libIndicateur +" : " + error.statusText,
            modalError: true
        });
    },

    showConfirmModal: function(){
        var modalView = new modal({
            modalTitle: "Suppression",
            modalBody: "Confirmer la suppression",
            modalFooter: '<button type="button" class="btn btn-default" data-dismiss="modal" id="annulDelete">Annuler</button><a class="btn btn-danger btn-ok" id="confirmDelete" data-dismiss="modal">Supprimer</a>'
        });
    },

    showEmptyModal: function(title, body){
        var modalView = new modal({
            modalTitle: title,
            modalBody: body
        });
    }
});

module.exports = view;