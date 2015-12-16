/*jslint node: true */
'use strict';

var User = require('../../models/User');

module.exports = function(router, io) {
	router.route('/users/:user_id/event')
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
};