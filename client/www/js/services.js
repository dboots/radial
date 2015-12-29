(function () {
	'use strict';
	angular.module('app.services', [])

	.factory('$global', function() {
		//-- TODO: Debug local/remote testing. Doesn't seem to be connecting to proper urls when local and/or emulating
		var proxy = 'http://localhost:1337/';
		var currentPlatform = ionic.Platform.platform();

		//var isLocal = top.location.toString().indexOf('localhost');
		var isLocal = (currentPlatform == 'macintel') ? true : false;

		switch (currentPlatform) {
			case 'linux':
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
			}
		};
	});
})();
