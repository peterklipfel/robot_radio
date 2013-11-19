
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var song_routes = require('./routes/song')
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon(__dirname+'/public/images/favicon.ico', { maxAge: 1000 }));
app.use(express.logger('dev'));
app.use(express.bodyParser({ keepExtensions: true, uploadDir: './uploads' }));
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
// app.use(express.favicon("public/images/favicon.ico"));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/radio/:file', routes.radio);
app.post('/songs/new', song_routes.post_new)
app.post('/songs/pick', song_routes.post_pick)
app.get('/songs', song_routes.song_index)
app.get('/songs/new', song_routes.get_new)
app.get('/songs/:id', song_routes.show_song)
app.get('/', routes.index);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
