(function () {
	'use strict';

	angular.module('app.services')
		.factory('MapService', function($cordovaGeolocation, $state, $q, $ionicPopup) {
			var _map;
			var _mapboxToken = 'pk.eyJ1IjoiZGJvb3RzIiwiYSI6ImNpZnNpMDBiaTE5eDByM2tyMHU0emluZTcifQ.Hl7P6OXhqxBkTqJ0J99eVA';
			var _mapId = 'dboots.cifshzz181hx0s8m6kj4sjv7w';
			var _mapElement = 'map';
			var _placeMarker = {};

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

					

					_map = L.mapbox.map(_mapElement, _mapId, {
						'minZoom': 12,
						'maxZoom': 15,
						'zoomControl': false
					}).setView([my_position.coords.latitude, my_position.coords.longitude], 12);
					

					var _geocoder = L.mapbox.geocoderControl('mapbox.places', {
						proximity: true,
						autocomplete: true
					}).addTo(_map);

					_geocoder.on('select', function(f) {
						_map.removeLayer(_placeMarker);
						var coord = f.feature.geometry.coordinates;
						_placeMarker = L.marker([coord[1], coord[0]]).addTo(_map);
					});

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
						MapService.Marker(latLng, userEvents[i]);
					}

					//-- Plot User's Following events
					for(var j = 0, userLen = userFollowing.length; j < userLen; j++) {
						var followingUserEvents = (userFollowing[j].user !== null) ? userFollowing[j].user.events : [];

						for(var k = 0, eventsLen = followingUserEvents.length; k < eventsLen; k++) {
							var evt = followingUserEvents[k];
							latLng = L.latLng(evt.latitude, evt.longitude);

							MapService.Circle(latLng, '#FF0000', evt);
							MapService.Marker(latLng, evt);
						}
					}
				},

				Circle: function(my_latLng, my_color, my_event) {
					//-- 1 mile = 1609.34 meters

					//-- TODO: Testing different circle/marker styles to be used in conjunction
					//-- with Event age. i.e. 1h past Event, 1h until Event, etc
					var circleOpts = MapService.CircleOpts(my_event.age, my_color);

					if (my_latLng) {
						var c = L.circle(my_latLng, 800, {
							stroke: false,
							color: circleOpts.color,
							fillOpacity: circleOpts.opacity
						}).addTo(_map);

						c.on('click', function(e) {
							MapService.EventClick(my_event);
						});
					}
				},

				EventClick: function(my_event) {
					if (my_event._id) {
						$state.go('main.event', {
							'id': my_event._id
						});
					}
				},

				CircleOpts: function(my_eventAge, my_color) {
					var circleOpts = {
						color: null,
						opacity: null
					};

					if (my_eventAge > 6) {
						//-- Event expired 6+ hours ago
						circleOpts.color = '#999999';
						circleOpts.opacity = 0.3;
					} else if (my_eventAge > 3) {
						//-- Event expired 3-6 hours ago
						circleOpts.color = '#999999';
						circleOpts.opacity = 0.8;
					} else if (my_eventAge < -6) {
						//-- 6+ hours in the future
						circleOpts.color = my_color;
						circleOpts.opacity = 0.3;
					} else if (my_eventAge < -3) {
						//-- 3-6 hours in the future
						circleOpts.color = my_color;
						circleOpts.opacity = 0.8;
					} else {
						circleOpts.color = my_color;
						circleOpts.opacity = 1;
					}

					return circleOpts;
				},

				Marker: function(my_latLng, my_event) {
					if (my_latLng) {
						var icon = L.icon({
							iconUrl: 'img/test.gif',
							iconSize: [50,50],
							iconAnchor: [25,25],
							className: 'gray-30'
						});

						var marker = L.marker(my_latLng, {icon: icon});

						marker.on('click', function(e) {
							MapService.EventClick(my_event);
						});

						marker.addTo(_map);
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