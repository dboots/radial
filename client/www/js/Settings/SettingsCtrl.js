(function () {
	'use strict';

	angular.module('app.controllers')
		.controller('SettingsCtrl', function($scope, UserService, $ionicPopup, $ionicHistory) {
			$scope.data = {};

			$scope.$on('$ionicView.enter', function() {
				$scope.user = UserService.User();
			});

			$scope.save = function() {
				UserService.Update($scope.user, $scope.data.newPassword, $scope.data.oldPassword).then(function(data) {
					$scope.data = {};
					
					$ionicPopup.show({
						title: 'Message',
						template: data.data.message,
						buttons: [
							{ text: 'Continue' }
						]
					}); //-- end $ioonicPopup()
				});
			};

			$scope.cancel = function() {
				$ionicHistory.goBack();
			};
		});
}());