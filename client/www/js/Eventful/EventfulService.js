(function () {
	'use strict';

	angular.module('app.controllers')
		.factory('EventfulService', ['$global', '$http', function($global, $http) {
			var _key = 'fvB6CnMq97xZBXLL';
			var _within = 20;
			var _plottedEvents = [];

			return {
				IsAdded: function(my_event) {
					for (var i = 0, len = _plottedEvents.length; i < len; i++) {
						var plottedEvent = _plottedEvents[i];

						if (my_event.title == plottedEvent.title)
							return true;
					}

					return false;
				},

				AddEvent: function(my_event) {
					_plottedEvents.push(my_event);
				},

				Search: function(my_location, my_query) {
					var url_appkey = 'app_key=' + _key;
					var url_location = 'location=' + my_location.coords.latitude + ',' + my_location.coords.longitude;


					var proxy = 'http://Dons-MacBook-Pro.local:1337/';
					var url = proxy + 'api.eventful.com/json/events/search?' + url_appkey + '&' + url_location + '&within=' + _within;

					//var url = 'http://api.eventful.com/json/events/search?' + url_appkey + '&' + url_location + '&within=' + _within;
					console.log('[EventfulService:Search] using url:', url);

					return $http.get(url);
				} //-- end Search()
			}; //-- end EventfulService object
		} //-- end EventfulService factory
	]);
})();