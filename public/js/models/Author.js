var app = app || {};

  // Author Model
  // ----------

  app.Author = Backbone.Model.extend({

    idAttribute: "_id",

    defaults: {
      username: 'username',
      last_updated_package: 'unknown package',
      maintains: [],
      num_downloads_for_maintained_packages: 0,
      num_votes_for_maintained_packages: 0,
    },

    urlRoot: '/user_name/peetle',

    parse: function(stuff) {
    	return stuff.content;
    }

  });
