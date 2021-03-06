 // js/view/packages.js

var app = app || {};

app.PackageView = Backbone.View.extend({

  tagName: 'div',

  className: 'package',

  template: _.template( $('#item-template').html() ),

  events: {
	   'click': 'expand' 
  },

  toggleDeps: function(event) {
    this.$('.deps-container').toggle();
    this.$('.full_deps-container').toggle();
    event.preventDefault();
		event.stopPropagation();
  },

  expand: function(event) {
		app.currentData.getPackage( this.model.id );
		//this.$('.data-container').toggle();
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
