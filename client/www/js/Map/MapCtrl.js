(function () {
	'use strict';

	angular.module('app.controllers')
		.controller('MapCtrl', function($scope, $ionicPopup, $ionicSideMenuDelegate, $global, $state, EventProviderService, MapService, UserService, EventService) {
			$scope.$on('$ionicView.enter', function(e) {
				$ionicSideMenuDelegate.canDragContent(false);

				var user = UserService.User();
				var map = MapService.Map();
				var epSrv = EventProviderService;

				if (UserService.User() === null) {
					$state.go('resume');
				} else {
					if (map === null) {
						MapService.Init().then(function(result) {
							epSrv.providers().then(function(data) {
								angular.forEach(data, function(i, v) {
									epSrv.get(i, MapService.Location().coords, {app_key: i.key}).then(function(data) {
										
										//-- TODO: Update EventProviderService to convert into valid Event objects before returning
										//-- Replace events in [provider] events array
										//-- i.e. events[eventful] = data.data.events.event
									});
								});
							});
							/*
							var map = {
								coords: {
									latitude: MapService.Map().getBounds()._northEast.lat,
									longitude: MapService.Map().getBounds()._northEast.lng
								}
							};
							EventfulService.Search(map).then(function(data) {

								for(var i = 0, len = data.data.events.event.length; i < len; i++) {
									var evt = data.data.events.event[i];
									var curr_event = {
										latitude: evt.latitude,
										longitude: evt.longitude,
										age: 0
									};

									//-- Add event to Eventful collection to prevent re-plotting and also to
									//-- create a library to reference when viewing details.
									console.log('[MapCtrl] IsAdded', EventfulService.IsAdded(evt));
									if (!EventfulService.IsAdded(evt)) {
										console.log('[MapCtrl] Adding event: ' + evt.title + ' @ ' + evt.venue_name, evt);
										EventfulService.AddEvent(evt);
										MapService.PlotEvent(curr_event);
									} else {
										console.log('[MapCtrl] Event already added', evt);
									}
								}
							});
							*/

							MapService.PlotEvents(user);

							//-- Add new event to the map
							result.map.on('click', function(e) {
								//-- Store map coords within EventService
								EventService.Latlng(e.latlng);
								$state.go('main.eventAdd');
							});

							//-- Show search results when moving map
							result.map.on('moveend', function(e) {
								var location = {
									latitude: this.getCenter().lat,
									longitude: this.getCenter().lng
								};

								console.log('[MapCtrl] location', location);
							});
						});
					}

				}
			});

			$scope.$on('$ionicView.leave', function(e){
				$ionicSideMenuDelegate.canDragContent(true);
			});

			$scope.search = {};
		});
}());