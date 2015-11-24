var _ = require('underscore');
var express = require('express');
var app = express();

//-- Socket.io
var http = require('http').Server(app);
var io = require('./sockets')(http);

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
	var data = req.body;

	user.email = data.email;
	user.fname = data.fname;
	user.lname = data.lname;

	bcrypt.hash(data.password, 10, function(err, hash) {
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
				token: token,
				user: user
			});
		});
	});
});

api.post('/authenticate', function(req, res, next) {
	User.findOne({
		email: req.body.email,
	}).populate({
		path: 'following.user',
		match: { 'following.accepted': true },
		select: 'fname lname events accepted'
	}).populate({
		path: 'following.userId.events'
	}).exec(function(err, user) {
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

				res.status(200).json({
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
			User.find({'email': query, '_id': {$ne: uid}}, '_id email fname lname', function(err, users) {
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

api.route('/users/following/:user_id')
	.post(function(req, res) {
		User.findById(req.params.user_id, function(err, user) {
			if (err)
				console.log(err);

			var isFollowing = false;
			var followUserId = req.body.followUserId;

			_.each(user.following, function(i) {
				if (i.user ==  followUserId) 
					isFollowing = true;
			});

			if (!isFollowing) {
				user.following.push({
					'user': followUserId
				});

				/*
				user.save(function(err) {
					User.populate(user, {
						path: 'following.user'
					}, function(err, u) {
						res.status(200).json({
							success: true,
							data: u.following
						})
					});
				});
				*/

				user.save(function(err) {
					if (err) console.log(err);

					res.status(200).json({
						success: true,
						message: 'Follow request sent! You will be notified when it is accepted'
					});
				})
			} else {
				res.status(200).json({
					success: false,
					message: 'Already requested follow!'
				});
			}
		});
	}
);

api.route('/users/:user_id/event')
	.put(function(req, res) {
		User.findById(req.params.user_id, function(err, user) {
			if (err)
				console.log(err);

			var eventObj = req.body.eventObj;

			user.events.push(eventObj);
			user.save();

			io.dispatch('add_event', eventObj);

			res.status(200).json({
				success: true,
				data: eventObj,
				message: 'Event added'
			});

		});
	}
);

api.route('/users/:user_id')
	.put(function(req, res) {
		User.findOne({_id: new ObjectId(req.params.user_id)}).populate('following.user').exec(function(err, user) {
			if (err)
				console.log(err);

			userData = req.body.user;

			if (user) {
				User.update({'_id': user._id}, {$set: userData}, function(err) {
					if (err)
						console.log(err);

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
	})

//-- ***
//-- End Router config
//-- ***
//-- Register Routes
app.use('/v1/api', api);

//-- Start Server
http.listen(port);
console.log('Server started on port: ' + port);

io.init(app);
console.log('Socket.io init complete');