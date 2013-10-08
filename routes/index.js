var http = require('http'),
    fileSystem = require('fs'),
    path = require('path')
    util = require('util'),
    sys = require('sys');

/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

exports.radio = function(req, res) {
  var filePath = path.join(__dirname, '../uploads/'+req.params.file+'.mp3');
  var stat = fileSystem.statSync(filePath);

  res.writeHead(200, {
    'Content-Type': 'audio/mpeg', 
    'Content-Length': stat.size
  });

  var readStream = fileSystem.createReadStream(filePath);
  // We replaced all the event handlers with a simple call to util.pump()
  readStream.pipe(res);
  readStream.on('end', function() {
    sys.puts('Goodbye\n');
  });
};