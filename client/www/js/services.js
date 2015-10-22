angular.module('starter.services', [])

.factory('$global', function() {
	//-- TODO: Debug local/remote testing. Doesn't seem to be connecting to proper urls when local and/or emulating
	var proxy = 'http://localhost:1337/';
	//var isLocal = top.location.toString().indexOf('localhost');
	var isLocal = (window.cordova) ? false : true;
	var serverUrl = (isLocal) ? 'http://localhost:4343' : 'http://radial-52832.onmodulus.net';

	var apiSuffix = '/v1/api';
	var apiUrl = serverUrl + apiSuffix;

	var _config = {
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
	}
})

.factory('LoginService', ['$global', '$http', function($global, $http) {
	return {
		loginUser: function(email, password) {
			return $http.post($global.config('api') + '/authenticate', {
				email: email, 
				password: password
			});
		}
	}
}])

.factory('SocketService', function($global, $q) {
	return {
		connect: function(my_data) {
			var d = $q.defer();

			socket = io.connect($global.config('server'), {
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
	}
})

.factory('MapService', function($cordovaGeolocation, UserService, $state, $q) {
	var _map;
	var _mapboxToken = 'pk.eyJ1IjoiZGJvb3RzIiwiYSI6ImNpZnNpMDBiaTE5eDByM2tyMHU0emluZTcifQ.Hl7P6OXhqxBkTqJ0J99eVA';
	var _mapId = 'dboots.cifshzz181hx0s8m6kj4sjv7w';
	var _mapElement = 'map';

	var MapService = {
		Init: function() {
			var d = $q.defer();

			var options = {timeout: 10000, enableHighAccuracy: true};
			$cordovaGeolocation.getCurrentPosition(options)
				.then(this.Success, this.Error)
				.then(function(data) {
					d.resolve({
						map: data.map
					});
				});

			return d.promise;
		},

		Success: function(my_position) {
			var d = $q.defer();

			var user = UserService.User();

			L.mapbox.accessToken = _mapboxToken;
			_map = L.mapbox.map(_mapElement, _mapId)
				.setView([my_position.coords.latitude, my_position.coords.longitude], 14);

			MapService.PlotEvents(user.events);

			d.resolve({
				map: _map
			})

			return d.promise;
		},

		PlotEvents: function(my_events) {
			for(var i = 0, len = my_events.length; i < len; i++) {
				var latLng = L.latLng(my_events[i].latitude, my_events[i].longitude);
				MapService.Circle(latLng, null);
			}
		},

		Circle: function(my_latLng, my_color) {
			//-- 1 mile = 1609.34 meters
			var c = L.circle(my_latLng, 800, {
				stroke: false,
				color: '#DEDEDE',
				fillOpacity: 0.8
			}).addTo(_map);

			c.on('click', function(e) {
				$state.go('main.event');
			});
		},

		Error: function(err) {
			console.log(err);
			console.log('code: '    + err.code    + '\n' + 'message: ' + err.message + '\n');
		},

		Map: function() {
			var d = $q.defer();
			if (_map == undefined) {
				MapService.Init().then(function(data) {
					_map = data.map;

					d.resolve({
						map: _map
					});
				});
			} else {
				d.resolve({
					map: _map
				});
			}

			return d.promise;
		},

		Remove: function() {
			if (_map) {
				_map.remove();
				_map = null;
			}

		}
	}

	return MapService;
})

.factory('RegisterService', ['$global', '$http', function($global, $http) {
	return {
		registerUser: function(email, password) {
			return $http.post($global.config('api') + '/register', {
				email: email,
				password: password
			});
		}
	}
}])

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

		AddEvent: function(my_position) {
			var newEvent = {
				latitude: my_position.latlng.lat,
				longitude: my_position.latlng.lng
			};

			_user['event_add'] = newEvent;

			UserService.Update(_user);
		}
	}

	return UserService;
});
