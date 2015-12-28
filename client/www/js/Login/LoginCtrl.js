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

      $scope.$createObservableFunction('login')     // the initial stream is {email,password}
        .flatMap(LoginService.rx_loginUser)         // the stream is now a login response (func rx_loginUser takes {email,password} and returns Observable<loginResponse>
        .do(function(loginResponse) {               // do doesn't transform the stream - we're just giving it a func to run onNext to attach behavior
          if(!loginResponse.data.success && loginResponse.data.message) {
            $ionicPopup.show({
              title: loginResponse.data.message,
              buttons: [
                { text: 'Try Again' }
              ]
            }); //-- end $ionicPopup()
          }
        })
        .filter(function(loginResponse) {           // filter for only successful responses - the do() above will have already shown a message
          return loginResponse.data.success;
        })
        .flatMap(SocketService.rx_connect)          // the stream is now a socket connection result (rx_connect() takes param loginResponse and returns Observable<ConnResult>
        .subscribe(                                 // subscribe to the stream - now that we're subscribed, the maps and filters above will run, and then the functions below
          // onNext - this function runs every time an element makes it through the stream to the end
          function(data) {
            //-- Store User object
            UserService.login(data);
            $state.go('main.map');
          },
          // onError - this function runs when an error happens that isn't handled - HTTP failures are handled by rx_loginUser, so this will (always?) be a socket issue.
          function(e) {
            console.log(e);
            //todo: retry? fall back to long polling? display alert?
          });

			$scope.register = function() {
				$state.go('register');
			};
		}); //-- end LoginCtrl
})();
