var app = angular.module('starter.controllers', ['ngCordova', 'ionic'])
	.controller('MainCtrl', function($scope, $filter, SearchService, UserService, $timeout, $ionicPopup, $global) {
		$scope.$on('$ionicView.enter', function(viewEvent) {
			var user = UserService.User();

			//-- Search box value from left menu
			$scope.query = [];

			//-- Data retrieved from $scope.search()
			$scope.searchResults = [];

			//-- Collection of unread notifications from logged in User object
			$scope.notificationCount = 0;

			angular.forEach(user.notifications, function(i, v) {
				if (!i.read)
					$scope.notificationCount++;
			})

			$scope.user = user;

			console.log('MainCtrl enter');
		});

		$global.socket().on('follow_approval', function(my_data) {
			console.log('follow_approval');

			$ionicPopup.show({
				title: '!!',
				template: 'Follow request approved!',
				buttons: [
					{ text: 'Ok' }
				]
			}); //-- end $ionicPopup()

			console.log(my_data);

			$scope.user.notificationCount++;
			$scope.user.notifications.push(my_data.notification);
			$scope.user.following.push(my_data.following);
		});

		$global.socket().on('follow_request', function(my_data) {
			$ionicPopup.show({
				title: '!!',
				template: 'Follow request!',
				buttons: [
					{ text: 'Ok' }
				]
			}); //-- end $ionicPopup()

			$scope.notificationCount++;
			$scope.user.notifications.push(my_data.notification);
			$scope.user.followers.push(my_data.follower);
		});

		var searchTimeout = true;

		$scope.follow = function(my_followUserId) {
			UserService.Follow(my_followUserId).then(function(data) {
				$ionicPopup.show({
					title: '!!',
					template: data.data.message,
					buttons: [
						{ text: 'Ok' }
					]
				}); //-- end $ionicPopup()
			});
		} //-- end $scope.follow

		$scope.search = function() {
			if ($scope.query.val && searchTimeout) {
				//-- Send uid with search request to exclude requesting user.
				var uid = UserService.User()._id;
				var query = $scope.query.val;

				console.log('searching for: ' + query);

				//-- This will be reset to true and allow another search request after the
				//-- above $timeout() is finished.
				searchTimeout = false;

				$timeout(function() {
					searchTimeout = true;
					console.log('searchTimeout: ' + searchTimeout);
				}, 1000);

				SearchService.Search(query, uid).then(function(data) {
					$scope.searchResults = data.data.result;
				});
			}
		};


	})

	.controller('NotificationsCtrl', function($scope, UserService) {
		$scope.$on('$ionicView.enter', function() {
			var user = UserService.User();
			$scope.user = user;

			//-- Clear notifications on load
			angular.forEach(user.notifications, function(i, v) {
				console.log(i);
				if (!i.read) {
					i.read = true;
					console.log('setting ' + i.title + ' read to true');
				}
			});

			UserService.Update(user);
		});
	})

	.controller('SettingsCtrl', function($scope, UserService, $ionicPopup, $ionicHistory) {
		$scope.$on('$ionicView.enter', function() {
			$scope.user = UserService.User();
		});

		$scope.save = function() {
			UserService.Update($scope.user).then(function(data) {
				$ionicPopup.show({
					title: 'Message',
					template: 'Your changes have been saved.',
					buttons: [
						{ text: 'Continue' }
					]
				}) //-- end $ioonicPopup()
			});
		}

		$scope.cancel = function() {
			console.log($ionicHistory.currentView());
			$ionicHistory.goBack();
		}

		/*
		$scope.takePicture = function(my_param) {
			var source = (my_isFromGallery) ? Camera.PictureSourceType.PHOTOLIBRARY : Camera.PictureSourceType.CAMERA;

			var options = {
				quality: 50,
				destinationType: Camera.DestinationType.DATA_URL,
				sourceType: source,
				allowEdit: true,
				encodingType: Camera.EncodingType.JPEG,
				targetWidth: 100,
				targetHeight: 100,
				popoverOptions: CameraPopoverOptions,
				saveToPhotoAlbum: false,
				correctOrientation: false
			};

			$cordovaCamera.getPicture(options).then(function(imageData) {
				$scope.data['imageData'] = imageData;
			}, function(err) {
				console.log(err);
			});
		}
		*/
	})

	.controller('FollowersCtrl', function($scope, UserService) {
		var user = UserService.User();

		$scope.approve = function(my_followUserId, my_approval) {
			UserService.FollowApproval(my_followUserId, my_approval).then(function(my_data) {
				resp = my_data.data;
				console.log(resp);

				angular.forEach(user.followers, function(i) {
					console.log(i);
					console.log('checking ' + i.user._id + ' :: ' + resp.follower)
					if (i.user._id == resp.follower.user) {
						i.accepted = resp.accepted;
						i.data = resp.date;
					}
				});

				$scope.user = user;
			});
		};
	})

	.controller('FollowingCtrl', function($scope, UserService) {
		var user = UserService.User();

		$scope.approve = function(my_approval, my_followerUserId) {
			angular.forEach(user.following, function(i, v) {
				if (i._id == my_followUserId) {
					console.log('approving follow request for: ' + my_followerUserId);
					i.accepted = true;
					UserService.Follower(my_followerUserId, user._id);
				}
			});
		};
	})

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
			}) //-- end $ionicPopup()
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
						}) //-- end $ionicPopup()
					}
				} 
			); //-- end .then()
		}

		$scope.register = function() {
			$state.go('register');
		}
	}) //-- end LoginCtrl

	.controller('RegisterCtrl', function($scope, $state, RegisterService, UserService, SocketService) {
		$scope.data = {};

		$scope.register = function() {
			RegisterService.registerUser($scope.data)
				.then(function(data) {
					if (data.data.success) {
						SocketService.connect(data)
							.then(function(data) {
								console.log(data);
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

	.controller('MapCtrl', function($scope, $ionicSideMenuDelegate, $ionicHistory, $global, $state, MapService, UserService, EventService) {
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

			$global.socket().on('add_event', function(my_event) {
				console.log('add_event triggered');
				console.log(my_event);
				var latLng = L.latLng(my_event.latitude, my_event.longitude);
				MapService.Circle(latLng, '#0000FF', my_event);
			});
		});

		$scope.$on('$ionicView.leave', function(e){
			$ionicSideMenuDelegate.canDragContent(true);
		});
	})

	.controller('EventDetailCtrl', function($scope, $stateParams, UserService, EventService) {
		var eventId = $stateParams.id;

		$scope.event = UserService.GetEvent(eventId);

		$scope.owner = function() {
			return (EventService.Events)
		}
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

			UserService.AddEvent(newEvent).then(function(data) {
				$state.go('main.map');
			});
		}

		$scope.cancel = function() {
			$state.go('main.map');
		}
	});
