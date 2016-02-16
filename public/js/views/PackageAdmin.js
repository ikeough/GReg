 // js/view/packages.js

var app = app || {};

app.PackageAdminView = Backbone.View.extend({

    tagName: 'div',

    className: 'package',

    template: _.template($('#admin-template').html()),
    
    events: {
        'click [type="checkbox"]':'set_whitelist',
    },

    set_whitelist: function(event){
        var whitelist_url = event.currentTarget.checked? '/whitelist/': '/unwhitelist/'

        $.ajax({
            url: whitelist_url + this.model.id,
            type:'PUT',
            success:function (data) {
                console.log(data);
            }
        });
    },
    
    initialize: function() {
        this.listenTo(this.model, 'change', this.render);
    },

    render: function() {

        this.$el.html( this.template( this.model.toJSON() ) );

        if (this.model.get('deprecated')){
            this.$el.addClass('deprecated');
        }

        return this;
    }

});