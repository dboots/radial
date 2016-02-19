(function () {
	'use strict';

	angular.module('app.controllers')
		.service('EventService', function() {
			var _latlng;
			var _events = [];
			
			var EventService = {
				Events: function(my_user) {
					if (my_user)
						_events = my_user['events'];

					return _events;
				},

				/*
				* Loop through User's Following collection retrieve Event by it's id
				*
				* my_eventId: String, ObjectId of the Event
				* my_following: Array, Following collection from logged in User
				*
				*/
				FollowerEvent: function(my_eventId, my_following) {
					for(var i = 0, len = my_following.length; i < len; i++) {
						console.log('[EventService.js:FollowerEvent] my_following[i].user', my_following[i].user);

						for(var j = 0, len_events = my_following[i].user.events.length; j < len_events; j++) {
							var following = my_following[i].user;
							var evt = following.events[j];

							if (evt._id == my_eventId) {
								evt.user = {
									name: following.fname + ' ' + following.lname
								};

								return evt;
							}
						}
					}
				},

				Event: function(my_eventId, my_user) {
					var evt = {};
					var events = my_user['events'];

					for(var i = 0, len = events.length; i < len; i++) {
						if (events[i]['_id'] == my_eventId) {
							events[i].user = {
								name: my_user.fname + ' ' + my_user.lname
							};

							console.log(evt);

							evt = events[i];
						}
					}

					return evt;
				},

				Latlng: function(my_latlng) {
					if (my_latlng)
						_latlng = my_latlng;

					return _latlng;
				},

				isOwner: function(my_eventId, my_user) {
					var events = my_user.events;

					for(var i = 0, len = events.length; i < len; i++) {
						if (events[i]._id == my_eventId)
							return true;
					}

					return false;
				}
			};

			return EventService;
		});
}());