
/**
 * Module dependencies.
 */
var express = require('express');
var http = require('http');
var path = require('path');
var io = require('socket.io');
var connections = 0;

var app = express();
var server = http.createServer(app);
io = io.listen(server);

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}

app.get('/', function(req, res){
	res.render('index', { title: 'Dibujemos' });
});

io.set('log level', 1);

io.sockets.on('connection', function (socket) {
	connections++;
	console.log('connected', connections);
	socket.broadcast.emit('connections', {connections:connections});
	
	socket.on('cmove', function (data) {
		socket.broadcast.emit('move', data);
	});	
	socket.on('cchat', function (data) {
		socket.broadcast.emit('chat', data);
	});
	
	socket.on('disconnect', function() {
		connections--;
		console.log('connected', connections);
		socket.broadcast.emit('connections', {connections:connections});
	});
});

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});