// Filename: router.js
define([
  'jQuery',
  'Underscore',
  'Backbone',
  'views/projects/list',
  'views/users/list'
], function($, _, Backbone, Session, projectListView, userListView){
  var AppRouter = Backbone.Router.extend({
    routes: {
      // Define some URL routes
      '/login': 'showLogin',
      '/showTasks': 'showTasks',
      
      // Default
      '*actions': 'showTasks'
    },
    showLogin: function(){
      // Call render on the module we loaded in via the dependency array
      // 'views/projects/list'
      projectListView.render();
    },
      // As above, call render on our loaded module
      // 'views/users/list'
    showTasks: function(){
      userListView.render();
    },
    defaultAction: function(actions){
      // We have no matching route, lets just log what the URL was
      console.log('No route:', actions);
    }
  });

  var initialize = function(){
    var app_router = new AppRouter;
    Backbone.history.start();
  };
  return { 
    initialize: initialize
  };
});

