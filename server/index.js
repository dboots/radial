/*jslint node: true */
'use strict';

var express = require('express');
var app = express();
var http = require('http').Server(app);

var io = require('./sockets')(http);
var config = require('./config');

require('./setup')(app);
var api = require('./app/router/router.js')(app, io, config);
var schedule = require('./app/schedule/schedule');


var mongoose = require('mongoose');
mongoose.connect(config.database, function(err) {
	if (err) throw err;
	console.log('[main] Mongo connected.');
});

//-- Init Socket.io
io.init();

//-- Start Server
http.listen(config.port);
console.log('[main] Server started on port: ' + config.port);