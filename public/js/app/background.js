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
                            if (jsonData.status === -2) {
                                // not found handler
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
        },
        htmlEntities: function (rawStr) {
            var encodedStr = rawStr.replace(/[\u00A0-\u9999<>\&]/gim, function(i) {
                return '&#'+i.charCodeAt(0)+';';
            });
            return encodedStr;
        },
        sanitize: function (rawStr) {
            return rawStr.replace(/[&\/\\#,+$~%.'":*?<>{}]/g, '');
        }
    };

    window.MusicInstant = musicInstant;
}(window, $));

(function (window, $) {
    'use strict';
    var currentRequest = null,
        callbacks = [],
        mi = new window.MusicInstant(),
        timer = null;

    requirejs.config({
        baseUrl: 'public/js/lib',
        paths: {
            app: 'public/js'
        },
        shim: {
            "jquery": {"exports": "jquery"},
            "bootstrap": {deps: ["jquery"]}
        }
    });

    /*
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
                console.log('test');
            });
        }
    );
    */

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
            //if (text.indexOf(' ') !== (text.length - 1) || (text.length <= 0)) {
            if (timer) {
                clearTimeout(timer);
                console.log('no response');
            }

            if (text !== '') {
                timer = setTimeout(function () {
                    // request for search only in 2 seconds delay
                    currentRequest = mi.search(text, function (json) {
                        var data = JSON.parse(json), suggestions = [], idx = 0;

                        // parse the result
                        for (idx = 0; idx < data.length && idx < 10; idx += 1) {
                            // save to localStorage
                            window.localStorage.setItem((idx + 1), JSON.stringify(data[idx]));
                            suggestions.push({content: (idx + 1) + " ", description: mi.sanitize(data[idx].song_name) + "_" + mi.sanitize(data[idx].artist_name) + "_" + mi.sanitize(data[idx].album_name)});
                        }
                        suggest(suggestions);
                    });
                }, 500);
            }
        }
    );

    // accept the url/music link
    chrome.omnibox.onInputEntered.addListener(function (url) {
        var songData = window.localStorage.getItem(url.trim());
        var parsedData = JSON.parse(songData);
        window.music = url.trim();
        $("#player").jPlayer("clearMedia").jPlayer("setMedia", {
            mp3: parsedData.song_link
        }).jPlayer("play");

        var opt = {
            type: "basic",
            title: parsedData.artist_name,
            message: parsedData.song_name + "\n" + parsedData.album_name,
            iconUrl: parsedData.album_photo
        };
        
        chrome.notifications.create('', opt, function () {});
        /* general web notification from MDN
        if (!("Notification" in window)) {
            window.alert("This browser does not support desktop notification");
        } else if (Notification.permission === "granted") {
            var notification = new Notification("Hi there!");
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission(function (permission) {
                if(!('permission' in Notification)) {
                    Notification.permission = permission;
                }
                if (permission === "granted") {
                    var notification = new Notification("Hi there!");
                }
            });
        }
        */
        /*
        chrome.tabs.query({active: true, currentWindow: true}, function (tab) {
            chrome.tabs.update(tab[0].id, {url: url});
            chrome.extension.sendMessage({song: tab[0].id}, function (response) {
                window.music = url.trim();//tab[0].id;
                console.log(response);
            });
        });
        */
    });

    chrome.omnibox.onInputStarted.addListener(function () {
        mi.updateDefaultSuggestion('select the music to play');
    });

    chrome.omnibox.onInputCancelled.addListener(function () {
        mi.resetDefaultSuggestion();
    });

    mi.resetDefaultSuggestion();
    $('#player').jPlayer({
        ready: function () {
            $(this).jPlayer("setMedia", {
                mp3: ""
            });
        },
        supplied: "mp3",
        swfPath: "public/js/lib/jplayer"
    });
    
    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
            console.log(sender.tab ?   "from a content script:" + sender.tab.url :
                                   "from the extension");
            console.log(request);
            if (request.status == "stop")
                $("#player").jPlayer("stop");
                //sendResponse({farewell: "goodbye"});
            if (request.status == "play")
                $("#player").jPlayer("play");
            if (request.status == "pause")
                $("#player").jPlayer("pause");
        });
}(window, $));
