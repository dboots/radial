(function () {
	'use strict';

	angular.module('app.controllers')
		.service('CommentService', function($http, $global, $q) {
			var _comments = {};

			var CommentService = {
				Comments: function(my_eventId) {
					var d = $q.defer();

					if (my_eventId in _comments) {
						d.resolve(_comments[my_eventId]);
						console.log('[CommentService] Comments from cache: ', _comments);
					} else {

						$http.get($global.config('api') + '/event/' + my_eventId + '/comments', {
							params: {
								token: window.localStorage['token']
							}
						}).then(function(data) {
							_comments[my_eventId] = data.data;
							console.log('[CommentService] Comments from db: ', _comments);
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