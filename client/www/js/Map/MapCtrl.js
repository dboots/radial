(function () {
	'use strict';

	angular.module('app.controllers')
		.controller('MapCtrl', function($scope, $ionicSideMenuDelegate, $ionicHistory, PlaceService, $global, $state, MapService, UserService, EventService) {
			$scope.$on('$ionicView.enter', function(e){
				$ionicSideMenuDelegate.canDragContent(false);
			});

			$scope.$on('$ionicView.leave', function(e){
				$ionicSideMenuDelegate.canDragContent(true);
			});

			$scope.search = {};

			MapService.Map().then(function(data) {
				MapService.PlotEvents(UserService.User());
				data.map.on('click', function(e) {
					//-- Store map coords within EventService
					EventService.Latlng(e.latlng);
					$state.go('main.eventAdd');
				});
			});

			$scope.geolocate = function() {

				$scope.search = {};

				if (navigator.geolocation) {
					navigator.geolocation.getCurrentPosition(function(position) {
						var geolocation = {
							lat: position.coords.latitude,
							lng: position.coords.longitude
						};

						var circle = new google.maps.Circle({
							center: geolocation,
							radius: position.coords.accuracy
						});

						autocomplete.setBounds(circle.getBounds());
					});
				}
			};

			$scope.gotoPlace = function() {
				$scope.query = '';

				var place = autocomplete.getPlace();
				MapService.Map().then(function(data) {
					var lat = place.geometry.location.lat();
					var lng = place.geometry.location.lng();
					data.map.setView([lat, lng], 12);
				});
			};

			var autocomplete = new google.maps.places.Autocomplete(document.getElementById('placeSearch'));
			autocomplete.addListener('place_changed', $scope.gotoPlace);
		});
}());