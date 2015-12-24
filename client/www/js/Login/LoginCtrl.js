(function () {
	'use strict';

	angular.module('app.controllers')
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
				}); //-- end $ionicPopup()
			});

      function submitLoginRequest(credentials) {
        var deferred = LoginService.loginUser(credentials.email, credentials.password);
        return rx.Observable
          .fromPromise(deferred);
      }

      $scope.$createObservableFunction('login')
        .map(function (email, password) { return {email:email, password:password}; })
        .flatMapLatest(submitLoginRequest)
        .subscribe(function(response) {
          if (response.data.success) {
            SocketService.connect(response)
              .then(function(data) {
                //-- Store User object
                UserService.login(data);
                $state.go('main.map');
              }
            );
          } else {
            $ionicPopup.show({
              title: response.data.message,
              buttons: [
                { text: 'Try Again' }
              ]
            }); //-- end $ionicPopup()
          }
        });

			$scope.register = function() {
				$state.go('register');
			};
		}); //-- end LoginCtrl
})();
