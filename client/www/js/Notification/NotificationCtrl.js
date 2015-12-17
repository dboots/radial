(function () {
	'use strict';

	angular.module('app.controllers')
		.controller('NotificationCtrl', function($scope, UserService) {
			$scope.$on('$ionicView.enter', function() {
				var user = UserService.User();
				$scope.user = user;

				//-- Clear notifications on load
				angular.forEach(user.notifications, function(i, v) {
					if (!i.read) {
						i.read = true;
						console.log('setting ' + i.title + ' read to true');
					}
				});

				UserService.Update(user);
			});
		});
}());