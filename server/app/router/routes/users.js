/*jslint node: true */
'use strict';

var User = require('../../models/User');
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var bcrypt = require('bcrypt');

module.exports = function(router) {
	//-- ***
	//-- /users
	//-- Create new User from email/password POST
	//-- ***

	router.route('/users')
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
					});
				});
			} else {
				res.json({
					success: false,
					result: {}
				});
			}
		}
	);

	router.route('/users/refresh')
		.post(function(req, res) {
			console.log('[app/router/routes/users.js] Refresh route is go!');
			var uid = req.body.uid;
			var token = req.body.token;

			console.log('uid: ', uid);
			console.log('token: ', token);

			if (token) {
				User.findOne({'_id': uid}).populate({
					path: 'followers.user',
					select: '_id fname lname events accepted'
				}).populate({
					path: 'following.user',
					select: '_id fname lname events accepted'
				}).populate({
					path: 'following.userId.events'
				}).exec(function(err, user) {
					if (err) console.log(err);

					res.json({
						success: true,
						token: token,
						user: user
					});
				});
			} else {
				res.json({
					success: false
				});
			}
		}
	);

	router.route('/users/:user_id')
		.put(function(req, res) {
			User.findOne({_id: new ObjectId(req.params.user_id)}).populate('following.user').exec(function(err, user) {
				if (err) console.log(err);

				var userData = req.body.user;
				var newPassword = req.body.newPassword;
				var oldPassword = req.body.oldPassword;

				if (user) {
					/*
					* If changing password, compare to existing password and if it is a match store
					* new hash in updated User document.
					*/

					if (newPassword) {
						bcrypt.compare(oldPassword, user.password, function(err, match) {
							console.log('[router/routes/users.js] match: ', match);
							if (match) {
								bcrypt.hash(newPassword, 10, function(err, hash) {
									console.log('[router/routes/users.js] userData.password: ', userData.password);
									userData.password = hash;
									console.log('[router/routes/users.js] userData.password: ', userData.password);

									User.update({'_id': user._id}, {$set: userData}, function(err) {
										if (err) console.log(err);

										console.log('[router/routes/users.js] User updated: ', userData);

										res.json({
											success: true,
											message: 'User updated'
										});
									}); //-- end User.update()
								});
							} else {
								console.log('[router/routes/users.js] no match');
								return res.json({
									success: true,
									message: 'Invalid password'
								});
								
							}
						});
					} else {
						User.update({'_id': user._id}, {$set: userData}, function(err) {
							if (err) console.log(err);

							console.log('[router/routes/users.js] User updated: ', userData);

							res.json({
								success: true,
								message: 'User updated'
							});
						}); //-- end User.update()
					}
				} else {
					res.json({
						success: false,
						message: 'User not found'
					});
				}
			});
		}
	);
};