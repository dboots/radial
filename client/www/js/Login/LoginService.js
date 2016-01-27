(function () {
	'use strict';

	angular.module('app.controllers')
		.factory('LoginService', ['$global', '$http', function($global, $http) {
			return {
				loginUser: function(email, password) {
					return $http.post($global.config('api') + '/authenticate', {
						email: email,
						password: password
					});
				}
			};
		}]);
})();