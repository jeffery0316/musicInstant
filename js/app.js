requirejs.config({
  //By default load any module IDs from js/lib
  baseUrl: 'js/lib',

  //except, if the module ID starts with "app",
  //load it from the js/app directory. paths
  //config is relative to the baseUrl, and
  //never includes a ".js" extension since
  //the paths config could be for a directory.
  paths: {
    app: '../app'
  },
  shim: {
    "jquery": {"exports": "jquery"},
    "bootstrap": {deps:["jquery"]}
  }
});

// TODO: should keep the version in some place
requirejs(['jquery', 
          'bootstrap', 
          'underscore', 
          'backbone', 
          'app/popup',
          'app/url'],
          function ($, bootstrap, popup, url) {
          }
);
