(function () {
	'use strict';

	console.log('[routes.js]');

	angular.module('starter')
		.config(function($stateProvider, $urlRouterProvider) {
			$stateProvider
				.state('login', {
					url: '/login',
					templateUrl: 'js/Login/Login.html',
					controller: 'LoginCtrl'
				})

				.state('register', {
					url: '/register',
					templateUrl: 'js/Register/Register.html',
					controller: 'RegisterCtrl'
				})

				.state('main', {
					url: '/main',
					abstract: true,
					templateUrl: 'js/Main/Main.html',
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
								templateUrl: 'js/Settings/Settings.html',
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
								templateUrl: 'js/Notification/Notification.html',
								controller: 'NotificationCtrl'
							}
						}
					}
				)
				.state('resume', {
					url: '/resume',
					controller: 'ResumeCtrl'
				});

			// if none of the above states are matched, use this as the fallback
			$urlRouterProvider.otherwise('/resume');
		});
}());