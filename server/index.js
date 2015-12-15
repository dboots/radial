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

io.init(app);
console.log('Socket.io init complete');

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

			io.socketChannel = 'user-' + user._id;

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
		path: 'followers.user',
		select: '_id fname lname events accepted'
	}).populate({
		path: 'following.user',
		select: '_id fname lname events accepted'
	}).populate({
		path: 'following.userId.events'
	}).exec(function(err, user) {
		if (err) throw err;

		if (!user) {
			res.json({success: false, message: 'Auth failed. User not found.'});
		} else if (user) {
			io.channels = [];
			io.channels.push('user-' + user._id);

			//-- Join user's following channels
			_.each(user.following, function(i) {
				io.channels.push('user-' + i.user._id);
			});

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

				//-- Join channel for user notifications
				//console.log('joining ' + socketChannel);
				//io.join(socketChannel);

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

api.route('/users/follow/:user_id')
	/*
	* Step 1 in Follower/Following process:
	* UserA (user_id) requests to follow UserB (followUserId) i.e. UserB.followers[] = { _id: UserA._id, accepted: false }.
	* Step 2 of process (via PUT), UserB approves follow request, therefore inserting UserB into UserA's following collection.
	* POST: /users/follow/userId
	* Params: [followUserId, accepted, token]
	*/
	.post(function(req, res) {
		//-- User requesting to follow
		var userId = req.params.user_id;
		
		//-- User being followed
		var followUserId = req.body.followUserId;

		//-- Index to determine if user has already requested to follow
		var isFollower = false;

		//-- Notification to be inserted into followUser's queue
		var objNotification = {
			title: 'New follower request!',
			date: new Date()
		};

		User.findById(userId, function(err, user) {
			if (err)
				console.log(err);

			//-- TOO: Convert to schema method
			//-- Add follower and notification to User requesting to be followed
			User.findById(followUserId, function(err, followUser) {
				_.each(followUser.followers, function(i) {
					if (i.user.equals(user._id)) {
						isFollower = true;
					}
				});

				console.log(isFollower);

				if (!isFollower) {
					followUser.followers.push({
						user: user._id,
						accepted: false
					});

					followUser.notifications.push(objNotification);

					followUser.save(function(err, doc) {
						if (err) console.log(err);

						var obj = {
							follower: {
								user: {
									_id: user._id,
									fname: user.fname,
									lname: user.lname
								},
								accepted: false
							},
							notification: objNotification
						};

						io.dispatch('follow_request', obj, followUserId);

						res.status(200).json({
							success: true,
							message: 'Follow request sent! You will be notified when it is accepted'
						});
					}); //-- end followUser.save();
				} else {
					res.status(200).json({
						success: false,
						message: 'Follow request already sent! You will be notified when it is accepted'
					});
				} //-- end isFollower check
			}); //-- end User.findById(followUserId);
		}); //-- end User.findById(userId)
	}) //-- end POST

/*
* UserB approved UserA's request     | UserA.following[] = { _id: UserB._id, accepted: [accepted] }
* PUT: /users/follow/userId          | UserB.followers[{_id: UserA._id, accepted: true}]
* Params: [followUserId, accepted, token]
*/
	.put(function(req, res) {
		//-- User responding to follow request
		var userId = req.params.user_id;

		//-- Subject of follow request
		var followUserId = req.body.followUserId;

		console.log(followUserId);

		//-- User's request response (true/false)
		var accepted = req.body.accepted;

		//-- Index to determine if user has already been approved
		var isFollower = false;

		//-- Notification to be inserted into followUser's queue
		var objNotification = {
			title: 'Follow request approved!',
			date: new Date()
		};

		//-- Follower object to send back to user's client
		var objFollower = {};

		//-- Lookup user that requested follow
		User.findById(userId, function(err, user) {
			if (err) console.log(err);

			//-- Update user's follower collection with decision and date
			_.each(user.following, function(i) {
				if (i.user.equals(followUserId)) {
					i.accepted = accepted;
					i.date = new Date();
				}
			});

			//-- Save user document and dispatch approval
			user.save(function(err) {
				if (err) console.log(err);

				if (accepted) {
					console.log(followUserId);
					//-- Lookup user that requested to follow
					User.findById(followUserId, function(err, follower) {
						//-- Make sure follower isn't added more than once.
						console.log(follower);
						_.each(follower.following, function(i) {
							if (i.user.equals(userId))
								isFollower = true;
						});

						if (!isFollower) {
							follower.following.push({
								user: userId,
								date: new Date()
							});

							//-- Add notification to follower's queue
							follower.notifications.push(objNotification);

							follower.save(function(err) {
								var obj = {
									following: {
										user: {
											fname: user.fname,
											lname: user.lname
										},
										date: new Date()
									},
									notification: objNotification
								};

								//-- Emit approved notification event
								io.dispatch('follow_approval', obj, followUserId);
							});
						} //-- end isFollower check

						//-- Create objFollower to send back to client to update user's follower collection
						objFollower = {
							user: follower._id,
							accepted: accepted,
							date: new Date()
						};

						res.status(200).json({
							success: true,
							message: 'Follow request updated',
							follower: objFollower
						});
					});
				}
			});
		}); //-- end PUT
}); //-- end /users/follow/:user_id route

api.route('/users/follower/:user_id/')
	.post(function(req, res) {
		var userId = req.params.user_id;
		var followerUserId = req.body.follower_id;

		//-- Lookup follower user and add loggedin user to followers collection.
		User.findById(followerUserId, function(err, user) {
			if (err) console.log(err);

			//-- TODO: Add check to see if follower exists

			user.followers.push({
				user: followerUserId
			});

			user.save(function(err) {
				if (err) console.log(err);

				//-- io.dispatch('follow_approved', {fname: user.fname, lname: user.lname}, followerUserId);

				res.status(200).json({
					success: true,
					message: 'Follower added'
				});
			})
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

			io.dispatch('add_event', eventObj, user._id);

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

