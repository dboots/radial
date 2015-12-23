(function () {
	'use strict';

	angular.module('app.services')
		.factory('MapService', function($cordovaGeolocation, $state, $q, $ionicPopup) {
			var _map;
			var _mapboxToken = 'pk.eyJ1IjoiZGJvb3RzIiwiYSI6ImNpZnNpMDBiaTE5eDByM2tyMHU0emluZTcifQ.Hl7P6OXhqxBkTqJ0J99eVA';
			var _mapId = 'dboots.cifshzz181hx0s8m6kj4sjv7w';
			var _mapElement = 'map';

			var MapService = {
				Init: function() {
					var d = $q.defer();

					var options = {timeout: 100000, enableHighAccuracy: true};
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

					//--var user = UserService.User();

					L.mapbox.accessToken = _mapboxToken;
					_map = L.mapbox.map(_mapElement, _mapId, { 'minZoom': 12, 'maxZoom': 15})
						.setView([my_position.coords.latitude, my_position.coords.longitude], 12);

					//--MapService.PlotEvents(user.events);

					d.resolve({
						map: _map
					});

					return d.promise;
				},

				PlotEvents: function(my_user) {
					var userEvents = my_user.events;
					var userFollowing = my_user.following;
					var latLng = {};

					//-- Plot User's own events
					for(var i = 0, len = userEvents.length; i < len; i++) {
						latLng = L.latLng(userEvents[i].latitude, userEvents[i].longitude);
						MapService.Circle(latLng, '#00FF00', userEvents[i]);
						MapService.Marker(latLng);
					}

					//-- Plot User's Following events
					for(var j = 0, userLen = userFollowing.length; j < userLen; j++) {
						var followingUserEvents = (userFollowing[j].user !== null) ? userFollowing[j].user.events : [];

						for(var k = 0, eventsLen = followingUserEvents.length; k < eventsLen; k++) {
							var evt = followingUserEvents[k];
							latLng = L.latLng(evt.latitude, evt.longitude);

							MapService.Circle(latLng, '#FF0000', evt);
							MapService.Marker(latLng);
						}
					}
				},

				Circle: function(my_latLng, my_color, my_event) {
					//-- 1 mile = 1609.34 meters
					if (my_latLng) {
						var c = L.circle(my_latLng, 800, {
							stroke: false,
							color: my_color,
							fillOpacity: 0.8
						}).addTo(_map);

						c.on('click', function(e) {
							if (my_event._id) {
								$state.go('main.event', {
									'id': my_event._id
								});
							}
						});
					}
				},

				Marker: function(my_latLng) {
					if (my_latLng) {
						var icon = L.icon({
							iconUrl: 'img/test.gif',
							iconSize: [50,50],
							iconAnchor: [25,25],
						});

						console.log('[MapService] Placing marker on map', my_latLng);

						L.marker(my_latLng, {icon: icon}).addTo(_map);
					}
				},

				Error: function(err) {
					$ionicPopup.show({
						title: 'Error',
						template: 'code: '    + err.code    + '<br />' + 'message: ' + err.message + '<br />trying again...',
						buttons: [
							{ text: 'Ok' }
						]
					}); //-- end $ionicPopup()

					MapService.Init();
				},

				Map: function() {
					var d = $q.defer();

					if (!_map) {
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
			};

			return MapService;
		});
}());