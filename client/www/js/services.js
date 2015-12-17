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
			case 'Linux':
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
			},

			socket: function(my_socket) {
				if (my_socket)
					_socket = my_socket;

				return _socket;
			}
		};
	})

	.factory('SocketService', function($global, $q) {
		return {
			connect: function(my_data) {
				var d = $q.defer();

				//-- io is referenced from .js file in index.html
				console.log('connecting with:', my_data.data.token);
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
	})


	.factory('RegisterService', ['$global', '$http', function($global, $http) {
		return {
			registerUser: function(my_data) {
				return $http.post($global.config('api') + '/register', my_data);
			}
		};
	}])

	.factory('UserService', function($global, $http) {
		var _user;

		var UserService = {
			login: function(data) {
				if (data) {
					window.localStorage['token'] = data.data.token;
					_user = data.data.user;
					console.log(_user);
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
				console.log('[FollowApproval] my_followUserId: ' + my_followUserId);
				return $http.put($global.config('api') + '/users/follow/' + _user._id, {
					followUserId: my_followUserId,
					accepted: my_approval,
					token: window.localStorage['token']
				});
			},

			//-- TODO: Pull token from LocalStorage service
			Update: function(my_user) {
				if (my_user) {
					console.log('updating:');
					console.log(my_user);
					var user_id = my_user._id;
					return $http.put($global.config('api') + '/users/' + user_id, {
						user: my_user,
						token: window.localStorage['token']
					});
				}
			},

			AddEvent: function(my_event) {
				if (my_event) {
					console.log('adding event to user:', _user);
					console.log(my_event);
					return $http.put($global.config('api') + '/users/' + _user._id + '/event', {
						eventObj: my_event,
						token: window.localStorage['token'],
					});
				}
			},

			xAddEvent: function(my_event) {
				console.log(my_event);
				if (my_event) {
					var newEvent = {
						latitude: my_event.latitude,
						longitude: my_event.longitude,
						title: my_event.title,
						description: my_event.description,
						startDate: my_event.startDate,
						endDate: my_event.endDate
					};

					_user['event_add'] = newEvent;
					UserService.Update(_user);

					return true;
				} else {
					return false;
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
	})

	.service('EventService', function($state) {
		var _latlng;
		var _events = [];
		
		var EventService = {
			Events: function(my_user) {
				if (my_user)
					_events = my_user['events'];

				console.log(_events);

				return _events;
			},

			Latlng: function(my_latlng) {
				if (my_latlng)
					_latlng = my_latlng;

				return _latlng;
			},

			Owner: function(my_user) {

			}
		};

		return EventService;
	})

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
})();
