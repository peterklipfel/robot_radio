var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

SongProvider = function(host, port) {
  this.db= new Db('node-mongo-blog', new Server(host, port, {auto_reconnect: true}, {}));
  this.db.open(function(){});
};


SongProvider.prototype.getCollection= function(callback) {
  this.db.collection('songs', function(error, song_collection) {
    if( error ) callback(error);
    else callback(null, song_collection);
  });
};

SongProvider.prototype.findAll = function(callback) {
  this.getCollection(function(error, song_collection) {
    if( error ) callback(error)
    else {
      song_collection.find().toArray(function(error, results) {
        if( error ) callback(error)
        else callback(null, results)
      });
    }
  });
};


SongProvider.prototype.findById = function(id, callback) {
  this.getCollection(function(error, song_collection) {
    if( error ) callback(error)
    else {
      song_collection.findOne({_id: song_collection.db.bson_serializer.ObjectID.createFromHexString(id)}, function(error, result) {
        if( error ) callback(error)
        else callback(null, result)
      });
    }
  });
};

SongProvider.prototype.save = function(songs, callback) {
  this.getCollection(function(error, song_collection) {
    if( error ) callback(error)
    else {
      if( typeof(songs.length)=="undefined")
        songs = [songs];

      for( var i =0;i< songs.length;i++ ) {
        song = songs[i];
        song.created_at = new Date();
        if( song.comments === undefined ) song.comments = [];
        for(var j =0;j< song.comments.length; j++) {
          song.comments[j].created_at = new Date();
        }
      }

      song_collection.insert(songs, function() {
        callback(null, songs);
      });
    }
  });
};

SongProvider.prototype.addCommentToSong = function(songId, comment, callback) {
  this.getCollection(function(error, song_collection) {
    if( error ) callback( error );
    else {
      song_collection.update(
        {_id: song_collection.db.bson_serializer.ObjectID.createFromHexString(songId)},
        {"$push": {comments: comment}},
        function(error, song){
          if( error ) callback(error);
          else callback(null, song)
        });
    }
  });
};

exports.SongProvider = SongProvider;