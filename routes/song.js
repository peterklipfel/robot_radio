var SongProvider = require('../songprovider-mongodb.js').SongProvider;
var songProvider = new SongProvider('localhost', '27017');
// var form = require('connect-form');
var sys = require("sys")
var util = require('util')
var echojs = require('echojs')
  , fs = require('fs')
  , path = require('path');

var echo = echojs({
  key: process.env.ECHONEST_KEY
});

exports.post_pick = function (req, res) {
  sys.puts(util.inspect(req.param('energy')))
  sys.puts(util.inspect(req.param('danceability')))
  sys.puts(util.inspect(req.param('acousticness')))
  sys.puts(util.inspect(req.param('liveness')))
  sys.puts(util.inspect(req.param('speechiness')))
  sys.puts(util.inspect(req.param('speed')))
  res.send({'file': '6991-1tgvunm'})
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
  fs.readFile(location, function (err, buffer) {
    echo('track/upload').post({
      filetype: path.extname(location).substr(1)
    }, 'application/octet-stream', buffer, function (err, json) {
      sys.puts(util.inspect(json));
    });
  });
  songProvider.save({
    title: req.param('title'),
    body: req.param('body'),
    path: req.files.song.path
  }, function( error, docs) {
    sys.puts(util.inspect(req.files))
    sys.puts(req.files.song.path)
    sys.puts("\n=> Done");
    res.redirect('/')
  });
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

