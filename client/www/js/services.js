(function () {
	'use strict';
	angular.module('app.services', [])

	.factory('$global', function() {
		var currentPlatform = ionic.Platform.platform();

		switch (currentPlatform) {
			case 'Linux':
			case 'macintel':
				isLocal = true;
				break;
		}

		var serverUrl = (isLocal) ? 'http://localhost:4343' : 'http://radial-52832.onmodulus.net';
		var apiSuffix = '/v1/api';
		var apiUrl = serverUrl + apiSuffix;

		var _config = {
			platform: currentPlatform,
			api: apiUrl,
			server: serverUrl,
			local: isLocal
		};

		var _socket = null;

		return {
			config: function(key, value) {
				if (!key)
					return _config;

				if (value)
					_config[key] = value;
				
				return _config[key];
			},

			socket: function(my_socket) {
				if (my_socket)
					_socket = my_socket;

				return _socket;
			}
		};
	});
})();
