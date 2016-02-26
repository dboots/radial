(function () {
	'use strict';

	angular.module('app.controllers')
		.factory('UserService', function($global, $http) {
			var _user = null;
			var _token = null;

			var UserService = {
				login: function(data) {
					if (data) {
						console.log('[UserService:login]', data);
						UserService.Token(data.data.token);
						UserService.User(data.data.user);

						window.localStorage['uid'] = data.data.user._id;
						console.log('[UserService:login]', _user);
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

				Refresh: function() {
					if (_token !== 'null') {
						console.log('[UserService:Refresh] refreshing user...', _token);
						console.log('[UserService:Refresh] uid: ', window.localStorage['uid']);
						return $http.post($global.config('api') + '/users/refresh/', {
							uid: window.localStorage['uid'],
							token: _token
						});
					}
				},

				Token: function(my_token) {
					if (my_token) {
						console.log('[UserService:Token] Setting token to localStorage.', my_token);
						window.localStorage['token'] = my_token;
						_token = my_token;
					}

					if (_token === undefined) {
						_token = window.localStorage['token'];
					}

					return _token;
				},

				User: function(my_user) {
					if (my_user) {
						console.log('[UserService:User] my_user: ', my_user);
						_user = my_user;
					}

					console.log('[UserService:User] returning:', _user);

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
				Update: function(my_user, my_newPassword, my_oldPassword) {
					if (my_user) {
						var user_id = my_user._id;
						return $http.put($global.config('api') + '/users/' + user_id, {
							user: my_user,
							oldPassword: my_oldPassword,
							newPassword: my_newPassword,
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