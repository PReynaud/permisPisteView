var template = require('./modal.hbs');
var templateError = require('./modalError.hbs');

var modal = Backbone.View.extend({
    $modalRoot: $('#modal-root'),

    initialize: function(options){
        this.modalTitle = options.modalTitle || '';
        this.modalBody = options.modalBody || '';
        this.modalFooter = options.modalFooter || '';
        this.modalError = options.modalError || false;

        this.render();

        if(this.modalError){
            $('#modalErrorView').modal('show');
        }
        else{
            $('#modalView').modal('show');
        }
    },

    render: function(){
        if(this.modalError){
            this.$modalRoot.html(templateError({title: this.modalTitle,
            body: this.modalBody, footer: this.modalFooter}));
        }
        else{
            this.$modalRoot.html(template({title: this.modalTitle,
            body: this.modalBody, footer: this.modalFooter}));
        }
    }
});

module.exports = modal;