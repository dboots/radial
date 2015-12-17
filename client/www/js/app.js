(function () {
	'use strict';
	// Ionic Starter App

	// angular.module is a global place for creating, registering and retrieving Angular modules
	// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
	// the 2nd parameter is an array of 'requires'
	// 'starter.services' is found in services.js
	// 'starter.controllers' is found in controllers.js
	angular.module('starter', ['ionic', 'app.controllers', 'app.services'])

	.run(function($ionicPlatform, $global, UserService, $state) {
		$ionicPlatform.ready(function() {

			if (UserService.User() === undefined)
				$state.go('login');

			// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
			// for form inputs)
			if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
				cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
				cordova.plugins.Keyboard.disableScroll(true);

			}
			if (window.StatusBar) {
				// org.apache.cordova.statusbar required
				StatusBar.styleLightContent();
			}
		});
	})
	.config(function($stateProvider, $urlRouterProvider) {
		$stateProvider
			.state('login', {
				url: '/login',
				templateUrl: 'js/Login/Login.html',
				controller: 'LoginCtrl'
			})

			.state('register', {
				url: '/register',
				templateUrl: 'templates/register.html',
				controller: 'RegisterCtrl'
			})

			.state('main', {
				url: '/main',
				abstract: true,
				templateUrl: 'templates/main.html',
				controller: 'MainCtrl'
			})

			.state('main.map', {
				url: '/map',
				views: {
					'mainContent': {
						templateUrl: 'js/Map/Map.html',
						controller: 'MapCtrl'
					}
				}
			})

			.state('main.eventAdd', {
				url: '/event',
				views: {
					'mainContent': {
						templateUrl: 'templates/event.html',
						controller: 'EventCtrl'
					}
				}
			})

			.state('main.event', {
				url: '/event/:id',
				views: {
					'mainContent': {
						templateUrl: 'templates/event-detail.html',
						controller: 'EventDetailCtrl'
					}
				},
				params: {'id': null}
			})

			.state('main.settings', {
				url: '/settings',
					views: {
						'mainContent': {
							templateUrl: 'templates/settings.html',
							controller: 'SettingsCtrl'
						}
					}
				}
			)

			.state('main.followers', {
				url: '/followers',
					views: {
						'mainContent': {
							templateUrl: 'templates/followers.html',
							controller: 'FollowersCtrl'
						}
					}
				}
			)

			.state('main.following', {
				url: '/following',
					views: {
						'mainContent': {
							templateUrl: 'templates/following.html',
							controller: 'FollowingCtrl'
						}
					}
				}
			)
			.state('main.notifications', {
				url: '/notifications',
					views: {
						'mainContent': {
							templateUrl: 'templates/notifications.html',
							controller: 'NotificationsCtrl'
						}
					}
				}
			);

		// if none of the above states are matched, use this as the fallback
		$urlRouterProvider.otherwise('/login');
	});
}());
