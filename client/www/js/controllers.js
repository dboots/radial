var app = angular.module('starter.controllers', ['ngCordova', 'ionic'])
	.controller('MainCtrl', function($scope, SearchService, UserService, $timeout) {
		$scope.data = [];
		$scope.searchResults = [];
		searchTimeout = true;

		$scope.search = function() {
			if ($scope.data.q && searchTimeout) {
				//-- Send uid with search request to exclude requesting user.
				var uid = UserService.User()._id;

				//-- This will be reset to true and allow another search request after the
				//-- above $timeout() is finished.
				searchTimeout = false;

				$timeout(function() {
					searchTimeout = true;
					console.log('searchTimeout: ' + searchTimeout);
				}, 1000);

				SearchService.Search($scope.data.q, uid).then(function(data) {
					$scope.searchResults = data.data.result;
				});
			}
		}
	})

	.controller('LoginCtrl', function($scope, LoginService, $state, $ionicPopup, $global, UserService, SocketService, MapService) {
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
			}) //-- end $iconicPopup()
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

	.controller('MapCtrl', function($scope, $ionicSideMenuDelegate, $global, $state, MapService, UserService, EventService) {
		$scope.$on('$ionicView.enter', function(e){
			$ionicSideMenuDelegate.canDragContent(false);
		});

		$scope.$on('$ionicView.leave', function(e){
			$ionicSideMenuDelegate.canDragContent(true);
		});

		MapService.Map().then(function(data) {
			//-- data.map.on('click', UserService.AddEvent);
			data.map.on('click', function(e) {
				//-- Store map coords within EventService
				EventService.Latlng(e.latlng);
				$state.go('main.eventAdd');
			});
		});

		$global.socket().on('event_add', function(my_event) {
			console.log('event_add triggered');
			var latLng = L.latLng(my_event.latitude, my_event.longitude);
			MapService.Circle(latLng, null, my_event);
		});
	})

	.controller('EventDetailCtrl', function($scope, $stateParams, UserService) {
		var eventId = $stateParams.id;
		$scope.event = UserService.GetEvent(eventId);
	})

	.controller('EventCtrl', function($state, $stateParams, $scope, EventService, UserService) {
		$scope.$on('$ionicView.enter', function(e){
			$scope.data = [];
			var id = $stateParams[0];
			var evt = UserService.GetEvent(id);
		});

		$scope.create = function() {
			var latlng = EventService.Latlng();
			var newEvent = {
				title: $scope.data.title,
				description: $scope.data.description,
				startDate: $scope.data.startDate,
				endDate: $scope.data.endDate,
				latitude: latlng.lat,
				longitude: latlng.lng
			};

			var success = UserService.AddEvent(newEvent);

			if (success) {
				$state.go('main.map');
			} else {
				$ionicPopup.show({
					title: data.data.message, 
					buttons: [
						{ text: 'Try Again' }
					]
				}) //-- end $iconicPopup()
			} //-- end success check
		}

		$scope.cancel = function() {
			$state.go('main.map');
		}
	});
