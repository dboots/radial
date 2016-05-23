(function () {
	'use strict';

	angular.module('app.controllers')
		.controller('MainCtrl', function($scope, $state, SearchService, EventfulService, MapService, UserService, EventService, SocketService, $timeout, $ionicPopup, $global) {
			$scope.$on('$ionicView.enter', function(viewEvent) {
				var user = UserService.User();

				EventService.Categories(UserService.Token()).then(function(data) {
					console.log('[MainCtrl] EventService Categories', data);
					$scope.categories = data.data;
				});

				$scope.show = {
					events: false,
					friends: false,
					followers: false
				};

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

			$scope.events = function(my_catId) {
				console.log('[MainCtrl::events()] getting events for ' + my_catId);

				var map = {
					coords: {
						latitude: MapService.Map().getBounds()._northEast.lat,
						longitude: MapService.Map().getBounds()._northEast.lng
					}
				};

				EventfulService.Search(map, {
					category: my_catId
				}).then(function(data) {
					console.log(data.data.events);
				});

				//-- Look up services for category
				//-- {id: 'foo', category: 'Foo', service: [{id: 'eventful', map: 'foobar'}, {id: 'groupon', map: 'foobr'}]}
				//-- For each service, use corresponding api and category map
				//-- Eventful: http://api.eventful.com/json/events/search?app_key=fvB6CnMq97xZBXLL&category=art,music&location=41.312629038747794,-81.08150482177734&within=20
			};

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