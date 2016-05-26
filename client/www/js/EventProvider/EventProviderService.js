(function () {
	'use strict';

	angular
		.module('app.controllers')
		.factory('EventProviderService', EventProviderService);

	EventProviderService.$inject = ['$global', '$http', '$q'];

	function EventProviderService($global, $http, $q) {
		var _proxy = ($global.config('local')) ? 'http://Dons-MBP:1337/' : 'http://';
		var _providers = [];

		var service = {
			loadProviders: loadProviders,
			providers: providers,
			get: get
		};

		return service;

		//////////////////////////////////

		function loadProviders() {
			return $http.get($global.config('api') + '/event/providers', {
				params: {
					token: localStorage.getItem('token')
				}
			});
		}

		function providers() {
			var defer = $q.defer();

			if (_providers.length)
				defer.resolve(_providers);

			loadProviders().then(function(res) {
				defer.resolve(res.data.data);
			});

			return defer.promise;
		}
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

		Options specific to provider. This would most likely be used for params specific to each
		API
		my_opts = {
			app_key: 'xxxxxxx'
			within: 100,
			category: 1,2,3
		}

		*/
		
		function get(my_provider, my_location, my_opts) {
			var url = _getUrl(my_provider, my_location, my_opts);
			console.log('[EventProviderService:Search] using url:', url);
			return $http.get(url);
		}

		function _getUrl(my_provider, my_location, my_opts) {
			//-- Create base API url
			var url = _proxy + my_provider.url + '?1=1';

			//-- Append location details
			url += '&location=' + my_location.latitude + ',' + my_location.longitude;

			//-- Construct passed opts
			for (var prop in my_opts) {
				url += '&' + prop + '=' + my_opts[prop];
			}

			return url;
		}
	}
})();