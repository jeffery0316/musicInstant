/*global window, chrome, XMLHttpRequest, requirejs, tester, $*/
/*jslint indent: 4 */

(function (window, $) {
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
            var url,
                req,
                self = this;
            url = tester.server + "?action=chr_query&keyword=" + query;
            req = new XMLHttpRequest();
            req.open('GET', url, true);
            req.onreadystatechange = (function (self) {

                return function () {
                    if (req.readyState === 4) {
                        try {
                            var jsonData = JSON.parse(req.responseText);
                            if (jsonData.status === -1) {
                                window.alert('needs to reconnect');
                                self.reconnect();
                            }
                        } catch (exception) {
                            window.alert(req.responseText);
                        }
                        callback(req.responseText);
                    }
                };
            }(self));
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
            // connect issue, if connect lost, reconnect
            console.log('later on we try to reconnect to server');
            $.ajax({
                type: 'POST',
                url: tester.server + 'index.php',
                data: {acc: tester.acc, pwd: tester.pwd, login: 1}
            }).done(function (msg) {
                console.log(msg);
            });
        }
    };

    window.MusicInstant = musicInstant;
}(window, $));

(function (window, $) {
    'use strict';
    var currentRequest = null,
        callbacks = [],
        mi = new window.MusicInstant();

    requirejs.config({
        baseUrl: 'js/lib',
        paths: {
            app: './js'
        },
        shim: {
            "jquery": {"exports": "jquery"},
            "bootstrap": {deps: ["jquery"]}
        }
    });

    // requirejs example case
    requirejs(
        [
            'jquery',
            'underscore',
            'backbone'
        ],
        function ($) {
            $.ajax({
                type: "POST",
                url: tester.server,
                data: {'acc': 12345, 'pwd': 12345}
            }).done(function (msg) {
                console.log(msg);
            });
        }
    );

    chrome.omnibox.onInputChanged.addListener(
        function (text, suggest) {

            // reset the request
            if (currentRequest !== null) {
                currentRequest.onreadystatechange = null;
                currentRequest.abort();
                currentRequest = null;
            }

            if (text === ' ') {
                suggest(
                    [{
                        content: 'select music data',
                        description: 'type singer/song name...'
                    }]
                );
                return;
            }

            mi.updateDefaultSuggestion('select music...');

            // trigger to search after type 'space'
            if (text.indexOf(' ') !== (text.length - 1) || (text.length <= 0)) {
                console.log('no response');
            } else {

                // request for search only in 2 seconds delay
                currentRequest = mi.search(text, function (json) {
                    var data = JSON.parse(json), suggestions = [], idx = 0;


                    // parse the result
                    for (idx = 0; idx < data.length && idx < 10; idx += 1) {
                        // save to localStorage
                        window.localStorage.setItem((idx + 1), data[idx].song_link);

                        suggestions.push({content: (idx + 1) + ' ', description: data[idx].song_name});
                    }
                    suggest(suggestions);
                });
            }
        }
    );

    // accept the url/music link
    chrome.omnibox.onInputEntered.addListener(function (url) {
        var link = window.localStorage.getItem(url.trim());
        $('#player').jPlayer({
            ready: function () {
                $(this).jPlayer("setMedia", {
                    mp3: link
                }).jPlayer('play');
            },
            supplied: "mp3",
            swfPath: "js/lib/jplayer"
        });
        console.log('play');

        chrome.tabs.query({active: true, currentWindow: true}, function (tab) {
            chrome.tabs.update(tab[0].id, {url: url});
            chrome.extension.sendMessage({song: tab[0].id}, function (response) {
                window.music = tab[0].id;
                console.log(response);
            });
        });
    });

    chrome.extension.onMessage.addListener(function (request) {
        var callback = callbacks.shift();
        callback(request);
    });

    chrome.omnibox.onInputStarted.addListener(function () {
        mi.updateDefaultSuggestion('select the music to play');
    });

    chrome.omnibox.onInputCancelled.addListener(function () {
        mi.resetDefaultSuggestion();
    });

    mi.resetDefaultSuggestion();
}(window, $));
