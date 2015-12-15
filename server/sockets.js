'use strict'

var io = require('socket.io');
var ioJwt = require('socketio-jwt');
var _ = require('underscore');

module.exports = function(my_http) {
	var obj = {};
	var _ioServer;
	var _clientsConnected = 0;
	var _socket;

	_ioServer = io.listen(my_http);

	obj.channels = [];

	//--
	//-- @init(app) - Setup _ioServer to use jwt and define connect/disconnect events.
	//--
	obj.init = function(my_app) {
		_ioServer.use(ioJwt.authorize({
			secret: my_app.get('secret'),
			handshake: true
		}));

		_ioServer.on('connection', function(socket){
			connect();
			_socket = initSocket(socket);
		});

		console.log('[socket.js:init] init complete');
	}

	obj.dispatch = function(my_event, my_data, my_channel) {
		console.log('[socket.js:dispatch] dispatching to channel: ' + my_channel);
		switch (my_event) {
			case 'follow_approval':
				console.log('[socket.js:dispatch] sending follow approval to: ' + my_channel);
				_ioServer.to('user-' + my_channel).emit(my_event, my_data);
				break;
			case 'follow_request':
				console.log('[socket.js:dispatch] sending follow request to ' + my_channel);
				_ioServer.to('user-' + my_channel).emit(my_event, my_data);
				break;
			case 'add_event':
				console.log('[socket.js:dispatch] add_event', my_data);
				_ioServer.to('user-' + my_channel).emit(my_event, my_data);
				break;
		}
	}

	obj.join = function(my_channel) {
		console.log('joining channel: ' + my_channel);
		_socket.join(my_channel);
	}

	//-- **
	//-- Local functions
	//-- **

	function connect() {
		_clientsConnected++;
		console.log('[connect] Clients Connected:', _clientsConnected);
	}

	function disconnect() {
		_clientsConnected--;
		console.log('[disconnect] Clients Connected:', _clientsConnected);;
	}

	function initSocket(my_socket) {
		my_socket.on('error', function(err) {
			console.log('[initSocket] Socket.IO error:');
			console.log(err);
		});

		my_socket.on('disconnect', function(){
			disconnect();
		});

		_.each(obj.channels, function(i) {
			my_socket.join(i);
			console.log('joining: ' + i);
		});

		console.log('socket init complete');

		return my_socket;
	}

	return obj;
}


/*
var socket = function(http, app) {
	io.listen(http);

	var clientsConnected = 0;

	io.use(ioJwt.authorize({
		secret: app.get('secret'),
		handshake: true
	}));

	io.on('connection', function(socket){
		connect();

		socket.on('error', function(err) {
			console.log('Socket.IO error:');
			console.log(err);
		});

		socket.on('disconnect', function(){
			disconnect();
		});
	});
}
*/

//module.exports = socket;