(function () {
	'use strict';

	angular.module('app.controllers').controller('MapCtrl', function($scope, $ionicSideMenuDelegate, $ionicHistory, $global, $state, MapService, UserService, EventService) {
		$scope.$on('$ionicView.enter', function(e){
			//$ionicHistory.clearHistory();
			console.log($ionicHistory.viewHistory());
			$ionicSideMenuDelegate.canDragContent(false);

			MapService.Map().then(function(data) {
				MapService.PlotEvents(UserService.User());
				//-- data.map.on('click', UserService.AddEvent);
				data.map.on('click', function(e) {
					//-- Store map coords within EventService
					EventService.Latlng(e.latlng);
					$state.go('main.eventAdd');
				});
			});
		});

		$scope.$on('$ionicView.leav e', function(e){
			$ionicSideMenuDelegate.canDragContent(true);
		});
	});
}());