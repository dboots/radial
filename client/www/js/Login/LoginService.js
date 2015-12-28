(function () {
	'use strict';

	angular.module('app.controllers')
		.factory('LoginService', ['$global', '$http', 'rx', function($global, $http, rx) {
      var loginUser = function(email, password) {
        return $http.post($global.config('api') + '/authenticate', {
          email: email,
          password: password
        });
      };
			return {
				loginUser: loginUser,
        rx_loginUser:function(credentials) {
          return rx.Observable.fromPromise(loginUser(credentials.email, credentials.password))
        }
			};
		}]);
})();
