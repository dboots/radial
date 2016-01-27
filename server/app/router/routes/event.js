/*jslint node: true */
'use strict';

var User = require('../../models/User');
var Event = require('../../models/Event');

module.exports = function(router, io) {
	router.route('/users/:user_id/event')
		.put(function(req, res) {
			User.findById(req.params.user_id, function(err, user) {
				if (err)
					console.log(err);

				var eventObj = req.body.eventObj;

				console.log('[/routers/routes/event.js]', eventObj);
				var evt = new Event();
				evt.latitude = eventObj.latitude;
				evt.longitude = eventObj.longitude;
				evt.title = eventObj.title;
				evt.description = eventObj.description;
				evt.endDate = eventObj.endDate;
				evt.save();

				console.log('[/routers/routes/event.js]', evt);

				user.events.push(evt);
				user.save();

				io.dispatch('add_event', evt, user._id);

				res.status(200).json({
					success: true,
					data: evt,
					message: 'Event added'
				});

			});
		}
	);
};