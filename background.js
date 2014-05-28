/*global chrome, XMLHttpRequest */
/*jslint indent: 4 */

var currentRequest = null;
var countIdx = 0;
var periodTime = 0;
var lastText = "";
var date = new Date();

/*
var script = document.createElement('script');
script.setAttribute("type", "text/javascript");
script.setAttribute("async", true);
script.setAttribute("src", chrome.extension.getURL("js/require.js"));  

//Assuming your host supports both http and https
var head = document.head || document.getElementsByTagName("head")[0] || document.documentElement;
head.insertBefore(script, head.firstChild);
*/

requirejs.config({
  //By default load any module IDs from js/lib
  baseUrl: 'js/lib',
  paths: {
    app: './js'
  },
  shim: {
    "jquery": {"exports": "jquery"},
    "bootstrap": {deps:["jquery"]}
  }
});

// TODO: should keep the version in some place
requirejs(['jquery', 
          'underscore', 
          'backbone'],
          function ($, _, back) {
          }
);
(function(window) {

    var musicInstant = function (options) {
        /*
        _.extend(options, {
            countIdx: 0
        });
        */
    };

    musicInstant.prototype = {
        resetDefaultSuggestion: function () {
            // needs to change
            chrome.omnibox.setDefaultSuggestion({
                description: '<url><match>src:</match></url> Search KKBOX song'
            });
        },
        search: function (query, callback) {
            var url = server + "?action=chr_query&keyword=" + query;
            var req = new XMLHttpRequest();
            req.open('GET', url, true);
            req.onreadystatechange = function () {
                if (req.readyState === 4) {
                    callback(req.responseText);
                } else {}
            };
            req.send(null);
            return req;
        },
        updateDefaultSuggestion: function (text) {
            var description = text;
            chrome.omnibox.setDefaultSuggestion({
                description: description
            });
        },
        reconnect: function () {
        }
    };
    
    window.musicInstant = musicInstant;
})(window);

var mi = new musicInstant();
mi.resetDefaultSuggestion();
chrome.omnibox.onInputChanged.addListener(
    function (text, suggest) {

        date = new Date();

        // reset the request
        if (currentRequest !== null) {
            currentRequest.onreadystatechange = null;
            currentRequest.abort();
            currentRequest = null;
        }

        mi.updateDefaultSuggestion(text);
        if (text === ' ') {
            return;
        }

        //if (Math.abs(date.getSeconds() - periodTime) < 2) {
        if (text.indexOf(' ') !== (text.length - 1)) {
            console.log('no response');
        } else {
            
            // request for search only in 2 seconds delay
            currentRequest = mi.search(text, function (json) {
                var data = JSON.parse(json);
                var suggestions = [];
                var idx = 0;

                // parse the result
                for (idx = 0; idx < data.length && idx < 10; idx++) {
                    suggestions.push({content: (idx + 1) + ' ', description: data[idx].song_name});
                }
                suggest(suggestions);
            });
            periodTime = date.getSeconds();
        }
    }
);

// accept the url/music link
chrome.omnibox.onInputEntered.addListener(function (url, tab) {
    alert(url);
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        chrome.tabs.update(tabs[0].id, {url: url});
    });
});
chrome.omnibox.onInputStarted.addListener(function () {
    periodTime = date.getSeconds();
    mi.updateDefaultSuggestion('選擇播放的音樂');
});

chrome.omnibox.onInputCancelled.addListener(function () {
    mi.resetDefaultSuggestion();
});

