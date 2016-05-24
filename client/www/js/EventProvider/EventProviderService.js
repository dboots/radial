(function () {
	'use strict';

	angular.module('app.controllers')
		.factory('EventProviderService', ['$global', '$http', '$q', function($global, $http, $q) {
			var _proxy = ($global.config('local')) ? 'http://Dons-MBP:1337/' : 'http://';
			var _providers = [];

			var EventProviderService = {
				LoadProviders: function() {
					$http.get($global.config('api') + '/event/providers');
				},

				Providers: function() {
					var defer = $q.defer();

					if (_providers.length)
						defer.resolve(_providers);

					EventProviderService.LoadProviders().then(function(res) {
						defer.resolve(res.data);
					});

					return defer.promise;
				},

				/*
				
				my_provider = {
					id: 'eventful'
					url: 'api.eventful.com/json/events/search',
					key: 'fvB6CnMq97xZBXLL'
				}

				my_location = {
					latitude: 0,
					longitude: 0
				}

				Options specific to provider
				my_opts = {
					within: 100,
					category: 1,2,3
				}

				*/
				
				Get: function(my_provider, my_location, my_opts) {
					var url = _getUrl(my_provider, my_location, my_opts);
					console.log('[EventProviderService:Search] using url:', url);
					return $http.get(url);
				}
			};

			return EventProviderService;
		}]);

	function _getUrl(my_provider, my_location, my_opts) {
		//-- Create base API url
		var url = _proxy + my_provider.url + '?key=' + my_provider.key;

		//-- Append location details
		url += '&location=' + my_location.latitude + ',' + my_location.longitude;

		//-- Construct passed opts
		for (var prop in my_opts) {
			url += '&' + prop + '=' + my_opts[prop];
		}

		return url;
	}
})();