(function () {
	'use strict';

	angular.module('app.controllers')
		.controller('MapCtrl', function($scope, $ionicPopup, $ionicSideMenuDelegate, $ionicHistory, EventfulService, PlaceService, $global, $state, MapService, UserService, EventService) {
			$scope.$on('$ionicView.enter', function(e) {
				$ionicSideMenuDelegate.canDragContent(false);

				$scope.user = UserService.User();

				if (UserService.User() === null) {
					$state.go('resume');
				} else {
					console.log('[MapCtrl.js] MapService.Map() ', MapService.Map());
					if (MapService.Map() === null) {
						MapService.InitMap().then(function(data) {
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

							MapService.PlotEvents(UserService.User());
							$scope.init = true;

							//-- Add new event to the map
							data.map.on('click', function(e) {
								//-- Store map coords within EventService
								EventService.Latlng(e.latlng);
								$state.go('main.eventAdd');
							});

							//-- Show search results when moving map
							data.map.on('moveend', function(e) {
								var map = {
									coords: {
										latitude: MapService.Map().getCenter().lat,
										longitude: MapService.Map().getCenter().lng
									}
								};

								console.log(MapService.Map().getCenter());

								EventfulService.Search(map).then(function(data) {
									$scope.user.events = data.data.events.event.sort(function(a, b){
										if (a.title > b.title)
											return 1;
										if (a.title < b.title)
											return -1;
										return 0;
									});

									for(var i = 0, len = data.data.events.event.length; i < len; i++) {
										var evt = data.data.events.event[i];
										var curr_event = {
											latitude: evt.latitude,
											longitude: evt.longitude,
											age: 0
										};

										console.log('[MapCtrl] IsAdded', EventfulService.IsAdded(evt));
										if (!EventfulService.IsAdded(evt)) {
											console.log('[MapCtrl] Adding event: ' + evt.title + ' @ ' + evt.venue_name, evt);
											EventfulService.AddEvent(evt);
											MapService.PlotEvent(curr_event);
										} else {
											console.log('[MapCtrl] Event already added', evt);
										}
									}

									console.log('****** SEARCH COMPLETE ******');
								});
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