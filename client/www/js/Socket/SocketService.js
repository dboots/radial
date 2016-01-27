(function () {
	'use strict';

	angular.module('app.controllers')
		.factory('SocketService', function($global, $q) {
			return {
				connect: function(my_data) {
					var d = $q.defer();

					//-- io is referenced from socket.io.js file in index.html
					var socket = io.connect($global.config('server'), {
						query: 'token=' + my_data.data.token,
						forceNew: true
					});

					socket.on('connect', function() {
						//-- Store authorized socket for use in other controllers/services
						$global.socket(socket);

						d.resolve({
							data: my_data.data
						});
					});

					socket.on('connect_error', function(e) {
						console.log('error');
						console.log(e);
					});

					socket.on('connect_timeout', function(e) {
						console.log('timeout');
						console.log(e);
					});

					return d.promise;
				}
			};
		}
	);
}());