(function () {
	'use strict';

	angular.module('app.controllers')
		.controller('LoginCtrl', function($scope, LoginService, $state, $ionicPopup, $ionicHistory, $global, UserService, SocketService, MapService) {
			$scope.data = [];
			
			$scope.$on('$ionicView.enter', function() {
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

			$scope.data = [];
			$scope.data.email = 'fool@fool.com';
			$scope.data.password = 'foolpass';

			$scope.login = function() {
				console.log('[LoginCtrl.js] Attempting to login with ' + $scope.data.email + ' and ' + $scope.data.password);
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