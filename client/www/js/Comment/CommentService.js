(function () {
	'use strict';

	angular.module('app.controllers')
		.service('CommentService', function($http, $global, $q) {
			var _commentCache = {};

			var CommentService = {
				Comments: function(my_eventId) {
					var d = $q.defer();

					if (my_eventId in _commentCache) {
						d.resolve(_commentCache[my_eventId]);
					} else {

						$http.get($global.config('api') + '/event/' + my_eventId + '/comments', {
							params: {
								token: window.localStorage['token']
							}
						}).then(function(data) {
							_commentCache[my_eventId] = data.data;
							d.resolve(data.data);
						});
					}

					return d.promise;
				},

				Add: function(my_eventId, my_body, my_userId) {
					var d = $q.defer();
					
					$http.post($global.config('api') + '/event/' + my_eventId + '/comments', {
						body: my_body,
						userId: my_userId,
						token: window.localStorage['token']
					}).then(function(data) {
						d.resolve(data.data);
					});

					return d.promise;
				}
			};

			return CommentService;
		});

		
}());