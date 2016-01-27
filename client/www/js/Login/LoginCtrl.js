(function () {
	'use strict';

	angular.module('app.controllers')
		.controller('LoginCtrl', function($scope, LoginService, $state, $ionicPopup, $ionicHistory, $global, UserService, SocketService, MapService) {
			$scope.$on('$ionicView.enter', function() {
				$scope.data = [];
				$scope.data.email = 'fool';
				$scope.data.password = 'fool';

				UserService.logout();
				MapService.Remove();

				var currentPlatform = ionic.Platform.platform();

				$ionicPopup.show({
					title: 'Debug',
					template: 'Platform: ' + currentPlatform + '<br />Using ' + $global.config('server') + ' to connect.',
					buttons: [
						{ text: 'Thank you debug fairy!' }
					]
				}); //-- end $ionicPopup()
			});

			$scope.login = function() {
				LoginService.loginUser($scope.data.email, $scope.data.password)
					.then(function(data) {
						if (data.data.success) {
							SocketService.connect(data)
								.then(function(data) {
									//-- Store User object
									UserService.login(data);
									$state.go('main.map');
								}
							);
						} else {
							$ionicPopup.show({
								title: data.data.message,
								buttons: [
									{ text: 'Try Again' }
								]
							}); //-- end $ionicPopup()
						}
					}
				); //-- end .then()
			};

			$scope.register = function() {
				$state.go('register');
			};
		}); //-- end LoginCtrl
})();