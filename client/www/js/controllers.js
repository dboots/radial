var app = angular.module('starter.controllers', ['ngCordova', 'ionic'])

	.controller('LoginCtrl', function($scope, LoginService, $state, $ionicPopup, $global, UserService, SocketService, MapService) {
		$scope.$on('$ionicView.enter', function() {
			$scope.data = [];
			$scope.data.email = 'fool';
			$scope.data.password = 'fool';

			UserService.logout();
			MapService.Remove();
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
						}) //-- end $iconicPopup()
					}
				} 
			); //-- end .then()
		}

		$scope.register = function() {
			$state.go('register');
		}
	}) //-- end LoginCtrl

	.controller('RegisterCtrl', function($scope, $state, RegisterService, UserService, SocketService) {
		$scope.data = [];

		$scope.register = function() {
			RegisterService.registerUser($scope.data.email, $scope.data.password)
				.then(function(data) {
					if (data.data.success) {
						SocketService.connect(data)
							.then(function(data) {
								//-- Create User object
								UserService.login(data);
								$state.go('main.map');
							}
						); //-- end SocketService.connect()
					} //-- end success check 
				}
			); //-- end RegisterService.registerUser()
		} //-- end register()

		$scope.cancel = function() {
			$state.go('login');
		}
	}) //-- end RegisterCtrl

	.controller('MapCtrl', function($scope, $ionicSideMenuDelegate, $global, MapService, UserService) {
		$scope.$on('$ionicView.enter', function(e){
			$ionicSideMenuDelegate.canDragContent(false);
		});

		$scope.$on('$ionicView.leave', function(e){
			$ionicSideMenuDelegate.canDragContent(true);
		});

		MapService.Map().then(function(data) {
			data.map.on('click', UserService.AddEvent);
		});

		$global.socket().on('event_add', function(latLng) {
			console.log('event_add triggered');
			var latLng = L.latLng(latLng.latitude, latLng.longitude);
			MapService.Circle(latLng, null);
		});
	})

	.controller('EventCtrl', function($state, $scope) {
		$scope.cancel = function() {
			$state.go('main.map');
		}
	});
