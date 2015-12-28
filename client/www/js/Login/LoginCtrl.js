(function () {
	'use strict';

	angular.module('app.controllers',  ['rx', 'ngCordova'])
		.controller('LoginCtrl', function($scope, LoginService, $state, $ionicPopup, $ionicHistory, $global, UserService, SocketService, MapService, rx) {
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

      // FILTERS
      var invalidCredentials = function(credentials) {
        return !credentials.email
          || !credentials.password
          || credentials.email === ""
          || credentials.password === "";
      };

      var authFailure = function(loginResponse) {
        return !(loginResponse.data.success);
      };

      // SIGNALS
      /*
        The base "login" signal which is a composition of {email, password}, and a login click event
       */
      var login = $scope.$createObservableFunction('login');
      /*
        Invalid login signal - just filter for invalid credentials using the filter defined above
       */
      var loginInvalid = login.filter(invalidCredentials);
      /*
        Valid login signal - using the inverse of the filter defined above
       */
      var loginValid = login.filter(function(c){return !invalidCredentials(c)}).map(function(c){console.log(c);return c});
      /*
        Valid login signal combined with an http POST of credentials to /authenticate
       */
      var loginValidAuth = loginValid.flatMap(LoginService.rx_loginUser);
      /*
        A signal representing a valid login submission, a successful response from the server, but an invalid auth attempt
       */
      var loginValidAuthFail =
        loginValidAuth
          .filter(authFailure)
          .map(function(loginResponse) {
            return loginResponse.data.message;
          });
      /*
        A signal representing successful responses from a post on /authenticate
       */
      var loginValidAuthSuccess =
        loginValidAuth
          .filter(function(a){return !authFailure(a)});

      // SUBSCRIPTIONS
      loginInvalid
        .subscribe(function(){
          $ionicPopup.show({
            title: "Username & Password Required",
            buttons: [
              { text: 'Continue' }
            ]
          });
        });

      loginValidAuthFail
        .subscribe(function(message){
          $ionicPopup.show({
            title: message,
            buttons: [
              { text: 'Try Again' }
            ]
          }); //-- end $ionicPopup()
        },
        function(error) {
          $ionicPopup.show({
            title: "Service Issue",
            buttons: [
              { text: 'Try Again' }
            ]
          }); //-- end $ionicPopup()
        });

      //loginValidAuthSuccess
      //  // todo: instead of subscribing here, flatMap this socket connection in and subscribe the results of the composition
      //  .subscribe(function(loginResponse) {
      //    SocketService.connect(loginResponse)
      //      .then(function(data) {
      //        //-- Store User object
      //        UserService.login(data);
      //        $state.go('main.map');
      //      }
      //    );
      //  });

			$scope.register = function() {
				$state.go('register');
			};
		}); //-- end LoginCtrl
})();
