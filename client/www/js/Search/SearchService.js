(function () {
	'use strict';

	angular.module('app.controllers')
		.factory('SearchService', function($global, $http) {
			var SearchService = {
				Search: function(my_query, my_uid) {
					if (my_query) {
						return $http.get($global.config('api') + '/users', {
							params: {
								q: my_query,
								uid: my_uid,
								token: window.localStorage['token']
							}
						});
					}
				}
			};

			return SearchService;
		});
}());