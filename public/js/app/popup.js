/*global window, chrome, Backbone, requirejs, tester, document, define, localStorage */
/*jslint indent: 4 */

(function () {

    'use strict';

    define(['jquery', 'underscore', 'backbone', 'jplayer/jquery.jplayer.min'], function ($, _, Backbone, jPlayer) {
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
            songlist: [],
            initialize: function (options) {
                //this.bind("add", options.view.addPlayList);
            },
            request: function () {
                // get more song from server
                // this.sync();
                console.log('request song');
            },
            add: function (song) {
                this.set([song]);
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
            viewList: $('#viewPlaylist'),
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
            },
            changePlaylist: function () {
                console.log('change playlist');
                for (var i = 1; i <= window.playlist.length; i++) {
                    var song = window.playlist.get(i);

                    // add child (block)
                    $("#viewPlaylist").text(song.get('song'));
                }
            }
        });

        appview = new AppView();

        // get message from background
        $(document).ready(function () {

            // load user profile
            var userPlaylist = window.localStorage.getItem('playlist');
            if (_.isNull(userPlaylist)) {
                window.playlist = new PlayList;
                console.log('create empty playlist');
            }

            // interact with background page
            var bg = chrome.extension.getBackgroundPage();
            window.music = bg.music;

            // user data
            var userData = window.localStorage.getItem('sid');
            if (userData == null) {
            } else {
                $('.login_dialog').hide();
            }

            // load in from localStorage
            var songData = window.localStorage.getItem(window.music);
            var albumImg = document.getElementById('album');
            var parsedData = JSON.parse(songData);
            if (typeof parsedData !== 'undefined' && parsedData !== null) {
                document.getElementById('album').src = parsedData.album_photo;
                $('#artist_name').text(parsedData.artist_name);
                $('#album_name').text(parsedData.album_name);
            }

            $('#stop').on('click', function () {
                chrome.extension.sendMessage({status: "stop"}, function(response) {
                    console.log(response);
                });
            });

            $('#play').on('click', function () {
                chrome.extension.sendMessage({status: "play"}, function(response) {
                    console.log(response);
                });
            });

            $('#pause').on('click', function () {
                chrome.extension.sendMessage({status: "pause"}, function(response) {
                    console.log(response);
                });
            });

            //bind by changing songlist
            playlist.on('add', appview.changePlaylist);

            $('#add').on('click', function () {
                // add song into backbone.js
                var song = new Song();
                song.set({id: 1, 
                         "album": parsedData.album_name,
                         "artist": parsedData.artist_name,
                         "song": parsedData.song_name,
                         "link": parsedData.song_link
                });
                window.playlist.add(song);
            });

            login = function () {
                $.ajax({
                    type: "POST",
                    url: tester.server,
                    data: {acc: $('#acc').val(), pwd: $('#pwd').val(), login: 1}
                }).done(function (msg) {
                    if (parseInt(msg.trim(), 10) === 1) {
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

            $('#login').on('click', function () {
                login();
            });

            $('#logout').on('click', logout);

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
    });
}());
