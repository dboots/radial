(function () {
	'use strict';

	angular.module('starter', ['ionic', 'app.controllers', 'app.services', 'app.directives'])

	.run(function($ionicPlatform, $global, UserService, $state) {
		$ionicPlatform.ready(function() {
			console.log('[app.js] UserService.User()', UserService.User());
			if (typeof UserService.User() == 'undefined') {
				console.log('[app.js] redirecting to login');
				$state.go('login');
			}

			// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard for form inputs)
			if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
				cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
				cordova.plugins.Keyboard.disableScroll(true);

			}
			if (window.StatusBar) {
				// org.apache.cordova.statusbar required
				StatusBar.styleLightContent();
			}
		});
	});
}());
