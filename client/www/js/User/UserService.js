(function () {
	'use strict';

	angular.module('app.controllers')
		.factory('UserService', function($global, $http) {
			var _user;

			var UserService = {
				login: function(data) {
					if (data) {
						window.localStorage['token'] = data.data.token;
						_user = data.data.user;
					}

					return window.localStorage['token'];
				},

				logout: function() {
					window.localStorage['token'] = null;
					_user = null;

					if ($global.socket()) {
						$global.socket().disconnect();
						$global.socket(null);
					}
				},

				User: function(my_user) {
					if (my_user)
						_user = my_user;

					return _user;
				},

				Follow: function(my_followUserId) {
					return $http.post($global.config('api') + '/users/follow/' + _user._id, {
						followUserId: my_followUserId,
						token: window.localStorage['token']
					});
				},

				FollowApproval: function(my_followUserId, my_approval) {
					return $http.put($global.config('api') + '/users/follow/' + _user._id, {
						followUserId: my_followUserId,
						accepted: my_approval,
						token: window.localStorage['token']
					});
				},

				//-- TODO: Pull token from LocalStorage service
				Update: function(my_user) {
					if (my_user) {
						var user_id = my_user._id;
						return $http.put($global.config('api') + '/users/' + user_id, {
							user: my_user,
							token: window.localStorage['token']
						});
					}
				},

				AddEvent: function(my_event) {
					if (my_event) {
						return $http.put($global.config('api') + '/users/' + _user._id + '/event', {
							eventObj: my_event,
							token: window.localStorage['token'],
						});
					}
				},

				GetEvent: function(my_eventId) {
					var evt = {};
					var events = _user['events'];

					for(var i = 0, len = events.length; i < len; i++) {
						if (events[i]['_id'] == my_eventId)
							evt = events[i];
					}

					return evt;
				}
			};

			return UserService;
		});
}());