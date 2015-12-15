var User = require('../../models/User');
var _ = require('underscore');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

module.exports = function(router, io, config) {
	router.post('/authenticate', function(req, res, next) {
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
					var token = jwt.sign(user, config.secret, {
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
}