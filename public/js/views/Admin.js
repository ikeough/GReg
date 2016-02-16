var app = app || {};

app.AdminView = Backbone.View.extend({

    el: '.admin_list',
    
    initialize: function() { 
        this.$list = this.$('.admin_list')
        this.listenTo(app.Packages, 'sync', this.render );
    },

    render: function(arg) {
        
        this.$list.empty();
        var that = this;
            
        app.Packages.forEach(function(pkg) {
            var pkg_view = new app.PackageAdminView({ model: pkg});
            pkg_view.render();
            that.$el.append( pkg_view.$el );
        });
        
        return this;
    },
  
});