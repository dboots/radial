/*jslint node: true */
'use strict';

var User = require('../../models/User');
var Event = require('../../models/Event');
var Comments = require('../../models/Comment');
var EventCategory = require('../../models/EventCategory');

module.exports = function(router, io) {
	router.route('/event/categories')
		.get(function(req ,res) {
			EventCategory.find({}, function(err, cats) {
				if (err) console.log(err);

				res.status(200).json({
					data: cats
				});
			});
		} //-- end .get()
	); //-- end /event/categories

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
		} //-- end .put()
	);//-- end /users/:user_id/event route

	router.route('/event/:event_id/comments')
		.get(function(req, res) {
			var eventId = req.params.event_id;

			Comments
				.find({event: eventId})
				.populate({
					path: 'user',
					select: '_id fname lname'
				})
				.exec(function(err, comments) {
					console.log('[app/router/routes/event.js] comments: ', comments);
					res.status(200).json({
						comments: comments,
						success: true
					});
				});
		})

		.post(function(req, res) {
			var comment = new Comments();

			comment.body = req.body.body;
			comment.user = req.body.userId;
			comment.event = req.params.event_id;

			comment.save(function(err) {
				if (err) console.log(err);

				comment.populate({
					path: 'user',
					select: '_id fname lname'
				}, function(err, comment) {
					console.log('[app/router/routes/event.js] comment: ', comment);
					res.status(200).json({
						comment: comment,
						success: true
					});
				});
			});
		}
	);
};