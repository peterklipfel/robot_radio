var SongProvider = require('../songprovider-mongodb.js').SongProvider;
var songProvider = new SongProvider('localhost', '27017');
// var form = require('connect-form');
var sys = require("sys")
var util = require('util')
var echojs = require('echojs')
  , fs = require('fs')
  , path = require('path');
var vectorMath = require('../lib/vectorMath.js')
var fs = require('fs');

var echo = echojs({
  key: process.env.ECHONEST_KEY
});

exports.post_pick = function (req, res) {
  var title = ""
  songProvider.findAll( function(err, data){
    var least_difference = -1,
        reqVector = getVector(req.body);
    for(i in data){
      var song = data[i],
          dbVector = getVector(song.audio_summary)
      console.log(song.title)
      if(vectorMath.similarity(reqVector, dbVector) > least_difference){
        title = song.path
      }
      // console.log(song)
    }
    console.log(util.inspect(req.body))
    if (title.length>0) {
      var patt = new RegExp(/\/(\d+\-\w+)/);
      console.log(title)
      console.log(patt.exec(title)[1])
      res.send({'file': patt.exec(title)[1]})
    } else {
      res.send({"error": "Could not find a close enough song"})
    }
  })
}

exports.get_new = function(req, res){
  res.render('song_new.jade', { locals: {
      title: 'Upload Song'
    }
  });
}

exports.post_new = function (req, res) {
  // connect-form adds the req.form object
  // we can (optionally) define onComplete, passing
  // the exception (if any) fields parsed, and files parsed
  var location = req.files.song.path;
  console.log(util.inspect(location));
  fs.readFile(location, function (err, buffer) {
    echo('track/upload').post({
      filetype: path.extname(location).substr(1),
      bucket: "audio_summary"
    }, 'application/octet-stream', buffer, function (err, json) {
      console.log(util.inspect(err)) // == 0 on success?
      console.log("Echonest returned: ")
      console.log(util.inspect(json))
      if(err == 0){
        console.log(util.inspect(json.response.track));
        if(containsAllFields(json.response.track)){
          console.log("found all fields!");
          console.log(util.inspect(json.response.track));
          saveSong(req, json)
        } else {
          console.log("did not find all fields!");
          getEchonestWithID(req, json)
        }
      }
    });
  });
  res.redirect('/songs/new')
}

exports.show_song = function(req, res) {
  songProvider.findById(req.params.id, function(error, song) {
    res.render('song_show.jade',
    {
      title: song.title,
      song:song
    });
  });
}

exports.song_index = function(req, res){
  songProvider.findAll(function(error, docs){
    res.render('song_index', {
    title: 'Songs',
    songs: docs})
  });
};


/*
 * Create multipart parser to parse given request
 */

function parse_multipart(req) {
  var parser = multipart.parser();

  // Make parser use parsed request headers
  parser.headers = req.headers;

  // Add listeners to request, transfering data to parser

  req.addListener("data", function(chunk) {
      parser.write(chunk);
  });

  req.addListener("end", function() {
      parser.close();
  });

  return parser;
}

/*
 * Handle file upload
 */
function upload_file(req, res) {
  var form = new formidable.IncomingForm();

  form.parse(req, function(err, fields, files) {
    res.writeHead(200, {'content-type': 'text/plain'});
    res.write('received upload:\n\n');
    res.end(util.inspect({fields: fields, files: files}));
  });
  console.log("\n=> Done");
  return;
}

function getEchonestInfo (path) {
  var request = new XMLHttpRequest();
  var track = new Object();
  track.buffer = null;
  
}

function containsAllFields (track) {
  for(attr in track.audio_summary){
    if(track.audio_summary[attr] == null){
      return false;
    }
  }
  return true
}

function saveSong(req, json){
  songProvider.save({
    title: req.param('title'),
    body: req.param('body'),
    path: req.files.song.path,
    track: json.response.track,
  }, function( error, docs) {
    console.log(util.inspect(req.files))
    console.log(req.files.song.path)
    console.log("\n=> Done");
  });
}

function getVector(obj){
  return [obj.energy, obj.danceability, obj.acousticness, obj.liveness, 
          obj.speechiness, obj.valence]
}

function getEchonestWithID(req, json){
  console.log('getting info')
  var attempts = 0
  function delayedProfileRequest(json){
    attempts+=1
    setTimeout(function(){
      console.log('making another request 1')
      console.log("id = " + json.response.track.id)
      echo('track/profile').get({
        id: json.response.track.id,
        bucket: "audio_summary"
      }, handleResponse)
    }, 10000)
  }
  var handleResponse = function(err, json2) {
    console.log('handling response')
    console.log("error is: "+err)
    console.log(json2)
    if(!(typeof(json2)==="undefined" || json2===null)) {
      console.log(json2.response.track.audio_summary)
      if(containsAllFields(json2.response.track)){
        console.log("saving song")
        saveSong(req, json2)
      } else if(attempts > 5) {
        console.log("request failed")
        fs.unlink(req.files.song.path, function (err) {
          if (err) throw err;
          console.log('successfully deleted'+req.files.song.path);
        });
        return undefined
      } else {
        delayedProfileRequest(json2)
      }
    } else {
      console.log("json was null")
      delayedProfileRequest(json)
    }
  }
  echo('track/profile').get({
    id: json.response.track.id,
    bucket: "audio_summary"
  }, handleResponse)
}

