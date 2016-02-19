(function () {
	'use strict';

	angular.module('app.controllers')
		.controller('MapCtrl', function($scope, $ionicPopup, $ionicSideMenuDelegate, $ionicHistory, PlaceService, $global, $state, MapService, UserService, EventService) {
			$scope.$on('$ionicView.enter', function(e){
				$ionicSideMenuDelegate.canDragContent(false);

				//-- BUG: Related to the bug found in Main/MainCtrl.js, we need to check for a valid User.
				//-- Without this check, MapCtrl could attempt to PlotEvents without a valid User.Events collection
				if (UserService.User()) {
					MapService.Map().then(function(data) {
						MapService.PlotEvents(UserService.User());

						data.map.on('click', function(e) {
							//-- Store map coords within EventService
							EventService.Latlng(e.latlng);
							$state.go('main.eventAdd');
						});
					});
				}
			});

			$scope.$on('$ionicView.leave', function(e){
				$ionicSideMenuDelegate.canDragContent(true);
			});

			$scope.search = {};
		});
}());