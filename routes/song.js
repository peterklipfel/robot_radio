var SongProvider = require('../songprovider-mongodb.js').SongProvider;
var songProvider = new SongProvider('localhost', '27017');
// var form = require('connect-form');
var sys = require("sys")
var util = require('util')
var echojs = require('echojs')
  , fs = require('fs')
  , path = require('path');
var vectorMath = require('../lib/vectorMath.js')

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
      if(vectorMath.similarity(reqVector, dbVector) > least_difference){
        title = song.path
      }
      // console.log(song)
    }
    sys.puts(util.inspect(req.body))
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
  sys.puts(util.inspect(location));
  fs.readFile(location, function (err, buffer) {
    echo('track/upload').post({
      filetype: path.extname(location).substr(1),
      bucket: "audio_summary"
    }, 'application/octet-stream', buffer, function (err, json) {
      sys.puts(util.inspect(err)) // == 0 on success?
      sys.puts(util.inspect(json))
      if(err == 0){
        sys.puts(util.inspect(json.response.track));
        if(containsAllFields(json.response.track)){
          sys.puts("found all fields!");
          sys.puts(util.inspect(json.response.track));
          saveSong(req, json)
        } else {
          sys.puts("did not find all fields!");
          echo('track/profile').get({
            id: json.response.track.id,
            bucket: "audio_summary"
          }, function (err, json2) {
            sys.puts(util.inspect(json2.response.track));
            if(containsAllFields(json2.response.track)){
              saveSong(req, json2)
            } else {
              sys.puts("There was an error fetching the data")
            }
          });
        }
      }
    });
  });
  res.redirect('/')
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
  sys.puts("\n=> Done");
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
    echoNestId: json.response.track.id,
    audio_summary: json.response.track.audio_summary
  }, function( error, docs) {
    sys.puts(util.inspect(req.files))
    sys.puts(req.files.song.path)
    sys.puts("\n=> Done");
  });
}

function getVector(obj){
  return [obj.energy, obj.danceability, obj.acousticness, obj.liveness, 
          obj.speechiness, obj.valence]
}

