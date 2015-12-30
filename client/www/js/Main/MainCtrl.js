(function () {
	'use strict';

	angular.module('app.controllers')
		.controller('MainCtrl', ($scope, SearchService, MapService, UserService, SocketService, $timeout, $ionicPopup, rx) => {

      var user = UserService.User();
      user.notifications = user.notifications || [];
      user.followers = user.followers || [];
      $scope.unreadNotificationCount = 0;
      $scope.searchString = '';
      $scope.searchResults = [];
      rx.Observable.from(user.notifications)
        .filter(notification => !notification.read)
        .observeOn(rx.Scheduler.currentThread) // run synchronously
        .subscribe(notification => { $scope.unreadNotificationCount++ });
      $scope.user = user;

      $scope.$on('$ionicView.enter', viewEvent => {

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

      $scope.$createObservableFunction('follow')
        .flatMap(UserService.rx_follow)
        .subscribe(followResponse => {
          $ionicPopup.show({
            title: '!!',
            template: followResponse.data.message,
            buttons: [
              { text: 'Ok' }
            ]
          });
        });

      $scope
        .$toObservable('searchString')
        .filter(o => o.newValue)
        .sample(300)
        .map(searchStringObservable => searchStringObservable.newValue)
        .distinctUntilChanged()
        .flatMapLatest(searchString => SearchService.rx_search(searchString, UserService.User()._id))
        .subscribe(searchResponse => {
          $scope.searchResults = searchResponse.data.result;
          $scope.$apply();
        });

		});
}());
