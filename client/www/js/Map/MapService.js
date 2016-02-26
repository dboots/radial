(function () {
	'use strict';

	angular.module('app.services')
		.factory('MapService', function($cordovaGeolocation, $state, $q, $ionicPopup) {
			var _map = null;
			var _mapboxToken = 'pk.eyJ1IjoiZGJvb3RzIiwiYSI6ImNpZnNpMDBiaTE5eDByM2tyMHU0emluZTcifQ.Hl7P6OXhqxBkTqJ0J99eVA';
			var _mapId = 'dboots.cifshzz181hx0s8m6kj4sjv7w';
			var _mapElement = 'map';
			var _placeMarker = {};
			var _plottedEvents = [];

			var MapService = {
				Init: function() {
					var d = $q.defer();
					_plottedEvents = [];

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
						var coord = f.feature.geometry.coordinates;
						
						_map.removeLayer(_placeMarker);
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
					var evt = {};

					console.log('[MapService.js:PlotEvents]', _plottedEvents);

					//-- Plot User's own events
					for(var i = 0, len = userEvents.length; i < len; i++) {
						if (_plottedEvents.indexOf(userEvents[i]._id) == -1) {
							//-- Current event
							evt = userEvents[i];

							//-- Get position of event
							latLng = L.latLng(evt.latitude, evt.longitude);

							//-- Create circle on map
							MapService.Circle(latLng, '#00FF00', evt);

							//-- Add sticker to event
							MapService.Marker(latLng, evt);

							//-- Add event to plotted events cache to prevent from being plotted again
							_plottedEvents.push(evt._id);
						}
					}

					//-- Plot User's Following events
					for(var j = 0, userLen = userFollowing.length; j < userLen; j++) {
						//-- If Following user doesn't have any events, init to empty array
						var followingUserEvents = (userFollowing[j].user !== null) ? userFollowing[j].user.events : [];

						for(var k = 0, eventsLen = followingUserEvents.length; k < eventsLen; k++) {
							//-- Current Follower event
							evt = followingUserEvents[k];

							//-- Get position of Follower event
							latLng = L.latLng(evt.latitude, evt.longitude);

							//-- Create circle on map
							MapService.Circle(latLng, '#FF0000', evt);

							//-- Add sticker to Follower event
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
						//-- Default: full opacity
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

				Map: function(my_map) {
					if (my_map)
						_map = my_map;

					return _map;
				},

				InitMap: function() {
					console.log('[MapService:Map] _map: ', _map);
					var d = $q.defer();

					MapService.Init().then(function(data) {
						_map = data.map;

						d.resolve({
							map: _map
						});
					});


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