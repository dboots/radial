(function () {
	'use strict';

	angular.module('app.controllers')
		.controller('MainCtrl', function($scope, $state, SearchService, MapService, UserService, SocketService, $timeout, $ionicPopup, $global) {
			$scope.$on('$ionicView.enter', function(viewEvent) {
				var user = UserService.User();

				$scope.query = [];
				$scope.searchResults = [];
				$scope.notificationCount = 0;
				$scope.user = user;

				//-- Tally unread notification count
				if (user) {
					angular.forEach(user.notifications, function(i, v) {
						if (!i.read)
							$scope.notificationCount++;
					});
				}
			});

			var searchTimeout = true;

				//-- BUG: Related to the bug above, $global.socket() is also not defined and results in js errors
				if ($global.socket()) {

					$global.socket().on('follow_approval', function(my_data) {
						$ionicPopup.show({
							title: '!!',
							template: 'Follow request approved!',
							buttons: [
								{ text: 'Ok' }
							]
						}); //-- end $ionicPopup()

						$scope.notificationCount++;
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
						$scope.user.following.push(my_data.follower);
					});

					$global.socket().on('add_event', function(my_event) {
						console.log('[MainCtrl add_event]', my_event);
						var latLng = L.latLng(my_event.latitude, my_event.longitude);
						MapService.Circle(latLng, '#0000FF', my_event);
						//-- TODO: Add notification to Followers. Maybe.
					});
			} //-- end $global.socket() check

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
			}; //-- end $scope.follow

			$scope.search = function() {
				if ($scope.query.val && searchTimeout) {
					//-- Send uid with search request to exclude requesting user.
					var uid = UserService.User()._id;
					var query = $scope.query.val;

					//-- This will be reset to true and allow another search request after the
					//-- above $timeout() is finished.
					searchTimeout = false;

					$timeout(function() {
						searchTimeout = true;
					}, 1000);

					SearchService.Search(query, uid).then(function(data) {
						$scope.searchResults = data.data.result;
					});
				}
			};
		});
}());