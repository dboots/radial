(function () {
	'use strict';

	angular.module('app.controllers')
		.controller('LoginCtrl', ($scope, LoginService, $state, $ionicPopup, $ionicHistory, $global, UserService, SocketService, MapService) => {
			$scope.$on('$ionicView.enter', () => {
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
        .do(loginResponse => {                     // do doesn't transform the stream - we're just giving it a func to run onNext to attach behavior
          if(!loginResponse.data.success && loginResponse.data.message) {
            $ionicPopup.show({
              title: loginResponse.data.message,
              buttons: [
                { text: 'Try Again' }
              ]
            }); //-- end $ionicPopup()
          }
        })
        .filter(loginResponse => loginResponse.data.success)  // filter for only successful responses - the do() above will have already shown a message
        .flatMap(loginResponse =>                             // flat map socket connect (takes just token, returns void)
          SocketService
            .initSharedSocket(loginResponse.data.token)
            .map(() => loginResponse)                        // map void back to login response, since we need it at the end of the chain
        )
        .map(UserService.login)                               // since UserService.login() isn't observable/promise, we just use map
        .subscribe(                                           // subscribe to the stream - now that we're subscribed, the maps and filters above will run, and then the functions below
          token => $state.go('main.map'),
          err => console.log(err)
        );

			$scope.register = () => $state.go('register');
		}); //-- end LoginCtrl
})();
