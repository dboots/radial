var express = require('express');
var app = express();

//-- Socket.io
var http = require('http').Server(app);
var io = require('socket.io').listen(http);
var ioJwt = require('socketio-jwt');

//-- Mongo / Database
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;

//-- Testing/Debug
var bodyParser = require('body-parser');
var assert = require('assert');
var morgan = require('morgan');

//-- Security
var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');

//-- Configuration
var config = require('./config');

//-- Models
var User = require('./app/models/User');

//-- Configure app

app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Cache-Control, Pragma, Origin, Authorization, Content-Type, X-Requested-With");
	res.header("Access-Control-Allow-Methods", "GET, PUT, POST");
	return next();
});


app.use(morgan('dev'));


app.use(function(req, res, next) {
  if (req.method.toLowerCase() !== "options") {
    return next();
  }
  return res.send(204);
});


//-- Configure body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
//-- ****
//-- Begin Server
//-- ****

//-- Server variables
var port = process.env.PORT || 4343;

//-- Mongo variables
var mongoose = require('mongoose');
mongoose.connect(config.database, function(err) {
	if (err) throw err;

	console.log('Mongo connected.');
});

app.set('secret', config.secret);

//-- ***
//-- End Server
//-- ***
//-- Begin Router config
//-- ***

var api = express.Router();

//-- ***
//-- /authenticate route
//-- Validate User and return json with token if success
//-- ***

api.post('/register', function(req, res, next) {
	//-- TODO: Add User model validations

	var user = new User();
	user.email = req.body.email;

	bcrypt.hash(req.body.password, 10, function(err, hash) {
		user.password = hash;
	
		user.save(function(err, user) {
			if (err) return(next(err));

			//-- TODO: Move to module method
			var token = jwt.sign(user, app.get('secret'), {
				expiresInMinutes: 1440 //-- 24 hours
			});

			res.json({
				success: true,
				message: 'Registration success',
				token: token
			});
		});
	});
});

api.post('/authenticate', function(req, res, next) {
	User.findOne({
		email: req.body.email,
	}, function(err, user) {
		if (err) throw err;

		if (!user) {
			res.json({success: false, message: 'Auth failed. User not found.'});
		} else if (user) {
			//-- TODO: Move to Model method
			bcrypt.compare(req.body.password, user.password, function(err, match) {
				if (err)
					return next(err);
				if (!match)
					return res.json({success: false, message: 'Auth failed. Wrong password'});

				//-- TODO: Move to module method
				var token = jwt.sign(user, app.get('secret'), {
					expiresInMinutes: 1440 //-- 24 hours
				});

				res.json({
					success: true,
					message: 'Auth success',
					token: token,
					user: user
				});
			}) //-- end password check
		} //-- end user check
	}); //-- end User.findOne()
}); //-- end /authenticate POST route

//-- ***
//-- Middleware to protect API routes placed after this
//-- ***

api.use(function(req, res, next) {
	var token = req.body.token || req.param('token') || req.headers['x-access-token'];

	if (token) {
		jwt.verify(token, app.get('secret'), function(err, decoded) {
			if (err) {
				return res.json({success: false, message: 'Failed to authenticate token.'});
			} else {
				req.decoded = decoded;
				next();
			}
		});
	} else {
		return res.status(403).send({
			success: false,
			message: 'No token provded'
		});
	}
});

api.get('/', function(req, res) {
	res.json({ message: 'hooray! welcome to our api!' });   
});

//-- ***
//-- /users route
//-- Create new User from email/password POST
//-- ***

api.route('/users')
	.get(function(req, res) {
		var query = req.query.q;
		var uid = req.query.uid;

		if (query) {
			User.find({'email': query, '_id': {$ne: uid}}, '_id, email', function(err, users) {
				if (err)
					console.log(err);

				res.json({
					success: true,
					result: users
				})
			})
		}
	}
);

api.route('/users/:user_id')
	.put(function(req, res) {
		User.findById(req.params.user_id, function(err, user) {
			if (err)
				console.log(err);


			if (user) {
				newEvent = req.body.user.event_add;
				user.email = req.body.user.email;

				if (newEvent) {
					newEvent['_id'] = new ObjectId();
					user.events.push(newEvent);
				}

				user.settings.circleColor = '#000000';

				user.save(function(err) {
					if (err)
						console.log(err);

					//-- Broadcast newly saved event
					//-- TODO: Broadcast to User's followers only
					//-- TODO: Create and fire events specific to what was updated.
					io.emit('event_add', newEvent);

					res.json({
						success: true,
						message: 'User updated'
					});
				});
			} else {
				res.json({
					success: false,
					message: 'User not found'
				});
			}
		})
		//res.json({user: user});
	})

//-- ***
//-- End Router config
//-- ***
//-- Register Routes
app.use('/v1/api', api);

//-- Start Server
http.listen(port);
console.log('Server started on port: ' + port);

//-- ***
//-- End Start Server
//-- ***
//-- Begin Socket.IO
//-- ****

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

//-- ***
//-- End Socket.IO
//-- ***


function connect() {
	clientsConnected++;

	console.log('user connected. ' + clientsConnected + ' total.');
}

function disconnect() {
	clientsConnected--;

	console.log('user disconnected. ' + clientsConnected + ' total.');
}

function event_add(latLng) {
	/*
	var addEvent = function(db, callback) {
		db.collection('events').insertOne({
			'latitude' : latLng.latitude,
			'longitude' : latLng.longitude
		}, function(err, result) {
			assert.equal(err, null);
			console.log('Event created at ' + latLng.latitude + ', ' + latLng.longitude);
			callback(result);
		});
	}

	MongoClient.connect(url, function(err, db) {
		assert.equal(null, err);
		addEvent(db, function() {
			db.close();
		});
	});
	*/
}