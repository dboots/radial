var express = require('express');
var app = express();
var http = require('http').Server(app);

//-- Mongo / Database
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;

//-- Socket.io wrapper
var io = require('./sockets')(http);

//-- Configuration
var config = require('./config');

//-- Server setup (CORS, etc)
require('./setup')(app);

//-- Setup API routes
require('./app/router/router.js')(app, io, config);

//-- Mongo variables
var mongoose = require('mongoose');
mongoose.connect(config.database, function(err) {
	if (err) throw err;
	console.log('[main] Mongo connected.');
});

//-- Init Socket.io
io.init(app);

//-- Start Server
http.listen(config.port);
console.log('[main] Server started on port: ' + config.port);

