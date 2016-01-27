(function () {
	'use strict';

	angular.module('app.controllers')
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
					}); //-- end $ioonicPopup()
				});
			};

			$scope.cancel = function() {
				$ionicHistory.goBack();
			};
		});
}());