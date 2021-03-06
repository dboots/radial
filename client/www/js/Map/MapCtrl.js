(function () {
	'use strict';

	angular.module('app.controllers')
		.controller('MapCtrl', function($scope, $ionicPopup, $ionicSideMenuDelegate, $ionicHistory, PlaceService, $global, $state, MapService, UserService, EventService) {
			$scope.$on('$ionicView.enter', function(e){
				$ionicSideMenuDelegate.canDragContent(false);

				if (UserService.User() === null) {
					$state.go('resume');
				} else {
					console.log('[MapCtrl.js] MapService.Map() ', MapService.Map());
					if (MapService.Map() === null) {
						MapService.InitMap().then(function(data) {
							MapService.PlotEvents(UserService.User());
							$scope.init = true;
							data.map.on('click', function(e) {
								//-- Store map coords within EventService
								EventService.Latlng(e.latlng);
								$state.go('main.eventAdd');
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