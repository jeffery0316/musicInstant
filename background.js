/*global window, chrome, XMLHttpRequest, requirejs, server*/
/*jslint indent: 4 */
/*jshint strict: false*/

var currentRequest = null;
var periodTime = 0;
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
        "bootstrap": {deps: ["jquery"]}
    }
});

// should keep the version in some place
requirejs(['jquery',
          'underscore',
          'backbone'],
          function ($) {
        'use strict';
        $.ajax({
            type: "POST",
            url: server,
            data: {'acc': 12345, 'pwd': 12345}
        }).done(function (msg) {
            console.log(msg);
        });
    }
    );
(function (window) {

    'use strict';
    var musicInstant = function () {
        return;
    };

    musicInstant.prototype = {
        resetDefaultSuggestion: function () {
            // needs to change
            chrome.omnibox.setDefaultSuggestion({
                description: '<url><match>src:</match></url> Search KKBOX song'
            });
        },
        search: function (query, callback) {
            var url, req;
            url = server + "?action=chr_query&keyword=" + query;
            req = new XMLHttpRequest();
            req.open('GET', url, true);
            req.onreadystatechange = function () {
                if (req.readyState === 4) {
                    callback(req.responseText);
                }
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
            // connect issue
            console.log('later on we try to reconnect to server');
        }
    };

    window.MusicInstant = musicInstant;
}(window));

var mi = new window.MusicInstant();
mi.resetDefaultSuggestion();
chrome.omnibox.onInputChanged.addListener(
    function (text, suggest) {

        'use strict';
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
                var data = JSON.parse(json), suggestions = [], idx = 0;

                // parse the result
                for (idx = 0; idx < data.length && idx < 10; idx += 1) {
                    suggestions.push({content: (idx + 1) + ' ', description: data[idx].song_name});
                }
                suggest(suggestions);
            });
            periodTime = date.getSeconds();
        }
    }
);

// accept the url/music link
chrome.omnibox.onInputEntered.addListener(function (url) {
    'use strict';
    chrome.tabs.query({active: true, currentWindow: true}, function (tab) {
        chrome.tabs.update(tab[0].id, {url: url});
    });
});
chrome.omnibox.onInputStarted.addListener(function () {
    'use strict';
    periodTime = date.getSeconds();
    mi.updateDefaultSuggestion('select the music to play');
});

chrome.omnibox.onInputCancelled.addListener(function () {
    'use strict';
    mi.resetDefaultSuggestion();
});

