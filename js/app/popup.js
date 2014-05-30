/*global window, chrome, Backbone, requirejs, tester, document, define, localStorage */
/*jslint indent: 4 */

/**
 *  music list model
 */
(function () {

    'use strict';

    define(['jquery', 'underscore', 'backbone'], function ($, underscore, Backbone) {
        var Song, PlayList, AppView, login, logout, appview;
        Song = Backbone.Model.extend({
            defaults: {
                "index": 0,
                "album": "",
                "artist": "artists",
                "song": "unnamed song",
                "link": ""
            }
        });

        PlayList = Backbone.Collection.extend({
            initialize: function (options) {
                this.bind("add", options.view.addPlayList);
            },
            request: function () {
                // get more song from server
                // this.sync();
                console.log('request song');
            },
            add: function (song) {
                console.log('add song: ' + song);
            }
        });

        AppView = Backbone.View.extend({
            playIdx: 0,
            el: $('body'),
            initialize: function () {
                console.log('produce playlist');
                // produce a playlist
                // produce a song
                //this.song = new Song({view: this});
                //this.on('playNextSong playLastSong', update_playIdx);
            },
            backward: $('#backward'),
            forward: $('#forward'),
            events: {
                "click #backward": "last",
                "click #forward": "next",
                "playNextSong": "next",
                "playLastSong": "last"
            },
            next: function () {
                console.log("play next song.");
                this.listenTo(this.playlist, 'change', this.sync);
                this.playIdx += 1;
            },
            last: function () {
                console.log("play last song.");
                this.playIdx -= 1;
            },
            play: function () {
                //jPlayer
                console.log('play song: ' + this.idx);
            },
            stop: function () {
                console.log("stop playing.");
            },
            sync: function () {

                // check the index is on the top or not
                console.log('check the playlist status');
                if (this.playlist.length === this.playIdx) {
                    this.playlist.fetch();
                    //this.playlist.sync();
                }
            }
        });

        appview = new AppView();

        login = function () {
            $.ajax({
                type: "POST",
                url: tester.server + "index.php",
                data: {acc: $('#acc').val(), pwd: $('#pwd').val(), login: 1}
            }).done(function (msg) {

                // success
                if (msg === 1) {
                    $('.login_dialog').hide();
                    localStorage.setItem('sid', $('#acc').val());
                    console.log('log in success');
                }
            });
        };

        logout = function () {
            localStorage.removeItem('sid');
            console.log('logout');
        };

        $('#login').on('click', login);
        $('#logout').on('click', logout);

        //var mp = new MusicPlayer();
        //$('#backward').on('click', mp.last);
        //window.backward = mp.last;//new MusicPlayer;

        /*backward.on('change:color', function (model, color) {
          console.log(color + '1');
          $('body').css({background: color});
        });*/

        // get message from background
        $(document).ready(function () {
            var bg = chrome.extension.getBackgroundPage();
            window.music = bg.music;
        });
    /*
        var MusicPlayer = Backbone.View.extend({
          requestMusic: function() {
            var musicList = [];
            return musicList;
          },
          promptColor: function() {
            //var cssColor = prompt("Please enter a CSS color");
            //cssColor = 'white';
            //this.set({color: cssColor});
          }
        });
    */
    /*
        chrome.extension.onMessage.addListener(function (request, sender, sendResponse) {
            console.log(request);
            $('body').append('<div>123</div>');
            //$($('.form-group')[0]).append('hello');
            chrome.tabs.query({active: true}, function (tabs) {
                if (tabs.length === 0) {
                    sendResponse({});
                    return;
                }
                sendResponse({hello: 'Test'});
            });
        });
    */
    });
}());
