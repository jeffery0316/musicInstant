/**
 *  music list model 
 *
 */
define(['jquery', 'underscore', 'backbone'], function ($, underscore, backbone) {
    var Song = Backbone.Model.extend({
      defaults: {
        "index": 0,
        "album": "",
        "artist": "varied artists",
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
        // this.sync('read', );
      },
      add: function (song) {
      }
    });

    window.AppView = Backbone.View.extend({
      playIdx: 0,
      el: $('body'),
      initialize: function () {

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
      next: function() {
        console.log("play next song.");
        this.listenTo(this.playlist, 'change', this.sync);
        playIdx += 1;
      },
      last: function() {
        console.log("play last song.");
        playIdx -= 1;
      },
      play: function() {
        //jPlayer
      },
      stop: function() {
        console.log("stop playing.");
      },
      sync: function() {

        // check the index is on the top or not
        console.log('check the playlist status');
        if (this.playlist.length === playIdx) {
          this.playlist.fetch();
          //this.playlist.sync();
        }
      }

    });
    var appview = new AppView;

    var login = function () {
      $.ajax({
        type: "POST",
        url: server + "index.php",
        data: {acc: $('#acc').val(), pwd: $('#pwd').val(), login: 1}
      }).done(function (msg) {
        
        // success
        if (msg == 1) {
          $('.login_dialog').hide();
          localStorage.setItem('sid', $('#acc').val());
          console.log('log in success');
        }
      });
    };

    var logout = function () {
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

    //backward.promptColor();
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
