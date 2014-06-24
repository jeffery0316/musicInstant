requirejs.config({
  baseUrl: '../js/lib',
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
