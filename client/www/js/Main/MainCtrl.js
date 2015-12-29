(function () {
	'use strict';

	angular.module('app.controllers')
		.controller('MainCtrl', ($scope, SearchService, MapService, UserService, SocketService, $timeout, $ionicPopup, rx) => {

      var searchTimeout = true;

      $scope.$on('$ionicView.enter', viewEvent => {
        var user = UserService.User();
        user.notifications = user.notifications || [];
        user.followers = user.followers || [];
        $scope.unreadNotificationCount = 0;
        $scope.query = [];
        $scope.searchResults = [];
        rx.Observable.from(user.notifications)
          .filter(notification => !notification.read)
          .observeOn(rx.Scheduler.currentThread) // run synchronously
          .subscribe(notification => { $scope.unreadNotificationCount++ });
        $scope.user = user;
      });

      function onFollowEvent(msg, eventData) {
        $ionicPopup.show({
          title: '!!',
          template: msg,
          buttons: [
            { text: 'Ok' }
          ]
        }); //-- end $ionicPopup()
        $scope.user.notifications.push(eventData.notification);
        $scope.user.followers.push(eventData.follower);
        $scope.unreadNotificationCount++;
        $scope.$apply();
      }

      SocketService.sharedSocket().follower.approvals
        .subscribe(next => onFollowEvent('Follow request approved!', next));

      SocketService.sharedSocket().follower.requests
        .subscribe(next => onFollowEvent('Follow request!', next));

      SocketService.sharedSocket().event.adds
        .subscribe(next => {
          var latLng = L.next(my_event.latitude, next.longitude);
          MapService.Circle(latLng, '#0000FF', next);
          //-- TODO: Add notification to Followers. Maybe.
        });

			$scope.follow = (my_followUserId) => {
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

			$scope.search = () => {
				if ($scope.query.val && searchTimeout) {
					//-- Send uid with search request to exclude requesting user.
					var uid = UserService.User()._id;
					var query = $scope.query.val;

					//-- This will be reset to true and allow another search request after the
					//-- above $timeout() is finished.
					searchTimeout = false;

					$timeout(() => {
						searchTimeout = true;
					}, 1000);

					SearchService.Search(query, uid).then(function(data) {
						$scope.searchResults = data.data.result;
					});
				}
			};
		});
}());
