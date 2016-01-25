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

				Event: function(my_eventId, my_user) {
					var evt = {};
					var events = my_user['events'];

					for(var i = 0, len = events.length; i < len; i++) {
						if (events[i]['_id'] == my_eventId)
							evt = events[i];
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