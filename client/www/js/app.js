(function () {
	'use strict';

	angular.module('starter', ['ionic', 'app.controllers', 'app.services', 'rx'])

	.run(function($ionicPlatform, $global, UserService, $state) {
		$ionicPlatform.ready(function() {
			if (UserService.User() === undefined)
				$state.go('login');

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
