/*jslint node: true */
'use strict';

var User = require('../../models/User');
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;

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

	router.route('/users/:user_id')
		.put(function(req, res) {
			User.findOne({_id: new ObjectId(req.params.user_id)}).populate('following.user').exec(function(err, user) {
				if (err)
					console.log(err);

				var userData = req.body.user;

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
			});
		}
	);
};