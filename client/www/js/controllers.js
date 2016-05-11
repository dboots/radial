(function () {
	'use strict';

	angular.module('app.controllers', ['ngCordova', 'ionic'])
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
		.controller('ResumeCtrl', function($scope, UserService, $state, SocketService) {
			$scope.$on('$ionicView.enter', function(e) {
				console.log('[ResumeCtrl.js]', UserService.Token());
				if (UserService.Token() === null) {
					$state.go('login');
				} else {
					UserService.Refresh()
						.then(function(data) {
							console.log('[ResumeCtrl.js] data: ', data.data.success);
							if (data.data.success === false) {
								console.log('[ResumeCtrl.js] refresh failed, returning to login');
								$state.go('login');
							} else {
								console.log('[MainCtrl.js:UserService.Refresh.then()] data: ', data);
								UserService.User(data.data.user);
								SocketService.connect(data);
								$state.go('main.map');
							}
						}
					);
				}
			});
		})

		.controller('FollowersCtrl', function($scope, UserService) {
			var user = {};

			$scope.$on('$ionicView.enter', function() {
				user = UserService.User();
				$scope.user = user;
			});

			$scope.approve = function(my_followUserId, my_approval) {
				UserService.FollowApproval(my_followUserId, my_approval).then(function(my_data) {
					var resp = my_data.data;

					angular.forEach(user.followers, function(i) {
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
						i.accepted = true;
						UserService.Follower(my_followerUserId, user._id);
					}
				});
			};
		})

		

		.controller('RegisterCtrl', function($scope, $state, RegisterService, UserService, SocketService) {
			$scope.data = {};

			$scope.register = function() {
				RegisterService.registerUser($scope.data)
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
			}; //-- end register()

			$scope.cancel = function() {
				$state.go('login');
			};
		}) //-- end RegisterCtrl

		.controller('EventDetailCtrl', function($scope, $stateParams, UserService, EventService, CommentService) {
			var eventId, user, isOwner;

			$scope.$on('$ionicView.enter', function(e){
				eventId = $stateParams.id;
				service = $stateParams.service;
				user = UserService.User();

				//-- BUG: Related to the bug found in Main/MainCtrl.js, we need to check for a valid User.

				if (user) {
					CommentService.Comments(eventId).then(function(d) {
						$scope.comments = d.comments;
					});

					isOwner = EventService.isOwner(eventId, user);
					$scope.isOwner = isOwner;
					$scope.user = user;

					if (isOwner) {
						$scope.event = EventService.Event(eventId, user);
					} else {
						$scope.event = EventService.FollowerEvent(eventId, user.followers);
					}

					console.log('[EventDetailCtrl] User: ', user);
					console.log('[EventDetailCtrl] Event: ', eventId);
					console.log('[EventDetailCtrl] EventService.Event(): ', $scope.event);
				}
			});

			$scope.comment = function(my_comment) {
				CommentService.Add(eventId, my_comment, user._id).then(function(data) {
					$scope.comments.push(data.comment);
				});
			};
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
					var user = UserService.User();
					user.events.push(data.data.data);

					console.log(user);

					$state.go('main.map');
				});
			};

			$scope.cancel = function() {
				$state.go('main.map');
			};
		});
}());
