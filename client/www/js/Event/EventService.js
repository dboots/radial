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

				Latlng: function(my_latlng) {
					if (my_latlng)
						_latlng = my_latlng;

					return _latlng;
				},

				Owner: function(my_user) {

				}
			};

			return EventService;
		});
}());