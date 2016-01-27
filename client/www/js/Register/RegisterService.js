(function () {
	'use strict';

	angular.module('app.controllers')
		.factory('RegisterService', ['$global', '$http', function($global, $http) {
			return {
				registerUser: function(my_data) {
					return $http.post($global.config('api') + '/register', my_data);
				}
			};
		}]);
}());