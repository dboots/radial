'use strict'

var io = require('socket.io');
var ioJwt = require('socketio-jwt');

module.exports = function(my_http) {
	var obj = {};
	var _ioServer;
	var _clientsConnected = 0;

	_ioServer = io.listen(my_http);

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

			socket.on('error', function(err) {
				console.log('Socket.IO error:');
				console.log(err);
			});

			socket.on('disconnect', function(){
				disconnect();
			});
		});
	}

	obj.dispatch = function(my_event, my_data) {
		console.log('dispatching event:', my_event);
		switch (my_event) {
			case 'follow_request':
				console.log(my_data);
				break;
			case 'add_event':
				console.log('add_event');
				console.log(my_data);
				_ioServer.emit(my_event, my_data);
				break;
		}
	}

	//-- **
	//-- Local functions
	//-- **

	function connect() {
		_clientsConnected++;
		console.log('Clients Connected:', _clientsConnected);
	}

	function disconnect() {
		_clientsConnected--;
		console.log('Clients Connected:', _clientsConnected);;
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