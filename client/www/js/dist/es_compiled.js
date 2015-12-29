'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * A reactive wrapper around a socket.io socket.
 */

var RxSocket = (function () {
  function RxSocket(endpoint, settings) {
    _classCallCheck(this, RxSocket);

    this.endpoint = endpoint;
    this.settings = settings;
  }

  _createClass(RxSocket, [{
    key: 'connect',
    value: function connect() {
      var self = this; // not sure if this is needed in ecma6?
      return Rx.Observable.create(function (observer) {
        self.ioSocket = io.connect(self.endpoint, self.settings);
        self.ioSocket.on('connect', function () {
          observer.onNext();
          observer.onCompleted();
        });
        self.ioSocket.on('connect_error', function (e) {
          console.log('error');
          observer.onError(e);
        });
        self.ioSocket.on('connect_timeout', function (e) {
          console.log('timeout');
          observer.onError(e);
        });
      });
    }
  }, {
    key: 'disconnect',
    value: function disconnect() {
      if (this.ioSocket) this.ioSocket.disconnect();
    }
  }, {
    key: 'rx_on',
    value: function rx_on(method) {
      var self = this;
      return Rx.Observable.create(function (observer) {
        if (!self.ioSocket) {
          observer.onError("Socket not yet initialized!");
          return;
        }
        self.ioSocket.on(method, function (next) {
          observer.onNext(next);
        });
      });
    }
  }]);

  return RxSocket;
})();
'use strict';

(function () {
	'use strict';

	angular.module('app.controllers').controller('MapCtrl', function ($scope, $ionicSideMenuDelegate, $ionicHistory, $global, $state, MapService, UserService, EventService) {
		$scope.$on('$ionicView.enter', function (e) {
			$ionicSideMenuDelegate.canDragContent(false);

			MapService.Map().then(function (data) {
				MapService.PlotEvents(UserService.User());
				//-- data.map.on('click', UserService.AddEvent);
				data.map.on('click', function (e) {
					//-- Store map coords within EventService
					EventService.Latlng(e.latlng);
					$state.go('main.eventAdd');
				});
			});
		});

		$scope.$on('$ionicView.leave', function (e) {
			$ionicSideMenuDelegate.canDragContent(true);
		});
	});
})();
'use strict';

(function () {
  'use strict';

  angular.module('app.controllers').controller('MainCtrl', function ($scope, SearchService, MapService, UserService, SocketService, $timeout, $ionicPopup, rx) {

    var searchTimeout = true;

    $scope.$on('$ionicView.enter', function (viewEvent) {
      var user = UserService.User();
      user.notifications = user.notifications || [];
      user.followers = user.followers || [];
      $scope.unreadNotificationCount = 0;
      $scope.query = [];
      $scope.searchResults = [];
      rx.Observable.from(user.notifications).filter(function (notification) {
        return !notification.read;
      }).observeOn(rx.Scheduler.currentThread) // run synchronously
      .subscribe(function (notification) {
        $scope.unreadNotificationCount++;
      });
      $scope.user = user;
    });

    function onFollowEvent(msg, eventData) {
      $ionicPopup.show({
        title: '!!',
        template: msg,
        buttons: [{ text: 'Ok' }]
      }); //-- end $ionicPopup()
      $scope.user.notifications.push(eventData.notification);
      $scope.user.followers.push(eventData.follower);
      $scope.unreadNotificationCount++;
      $scope.$apply();
    }

    SocketService.sharedSocket().rx_on('follow_approval').subscribe(function (next) {
      return onFollowEvent('Follow request approved!', next);
    });

    SocketService.sharedSocket().rx_on('follow_request').subscribe(function (next) {
      return onFollowEvent('Follow request!', next);
    });

    SocketService.sharedSocket().rx_on('add_event').subscribe(function (next) {
      var latLng = L.next(my_event.latitude, next.longitude);
      MapService.Circle(latLng, '#0000FF', next);
      //-- TODO: Add notification to Followers. Maybe.
    });

    $scope.follow = function (my_followUserId) {
      UserService.Follow(my_followUserId).then(function (data) {
        $ionicPopup.show({
          title: '!!',
          template: data.data.message,
          buttons: [{ text: 'Ok' }]
        }); //-- end $ionicPopup()
      });
    }; //-- end $scope.follow

    $scope.search = function () {
      if ($scope.query.val && searchTimeout) {
        //-- Send uid with search request to exclude requesting user.
        var uid = UserService.User()._id;
        var query = $scope.query.val;

        //-- This will be reset to true and allow another search request after the
        //-- above $timeout() is finished.
        searchTimeout = false;

        $timeout(function () {
          searchTimeout = true;
        }, 1000);

        SearchService.Search(query, uid).then(function (data) {
          $scope.searchResults = data.data.result;
        });
      }
    };
  });
})();
'use strict';

(function () {
  'use strict';

  angular.module('app.controllers').controller('LoginCtrl', function ($scope, LoginService, $state, $ionicPopup, $ionicHistory, $global, UserService, SocketService, MapService) {
    $scope.$on('$ionicView.enter', function () {
      $scope.data = [];
      $scope.data.email = 'fool';
      $scope.data.password = 'fool';

      UserService.logout();
      MapService.Remove();

      var currentPlatform = ionic.Platform.platform();

      $ionicPopup.show({
        title: 'Debug',
        template: 'Platform: ' + currentPlatform + '<br />Using ' + $global.config('server') + ' to connect.',
        buttons: [{ text: 'Thank you debug fairy!' }]
      }); //-- end $ionicPopup()
    });

    $scope.$createObservableFunction('login') // the initial stream is {email,password}
    .flatMap(LoginService.rx_loginUser) // the stream is now a login response (func rx_loginUser takes {email,password} and returns Observable<loginResponse>
    .do(function (loginResponse) {
      // do doesn't transform the stream - we're just giving it a func to run onNext to attach behavior
      if (!loginResponse.data.success && loginResponse.data.message) {
        $ionicPopup.show({
          title: loginResponse.data.message,
          buttons: [{ text: 'Try Again' }]
        }); //-- end $ionicPopup()
      }
    }).filter(function (loginResponse) {
      return loginResponse.data.success;
    }) // filter for only successful responses - the do() above will have already shown a message
    .flatMap(function (loginResponse) {
      return (// flat map socket connect (takes just token, returns void)
        SocketService.initSharedSocket(loginResponse.data.token).map(function () {
          return loginResponse;
        })
      );
    } // map void back to login response, since we need it at the end of the chain
    ).map(UserService.login) // since UserService.login() isn't observable/promise, we just use map
    .subscribe( // subscribe to the stream - now that we're subscribed, the maps and filters above will run, and then the functions below
    function (token) {
      return $state.go('main.map');
    }, function (err) {
      return console.log(err);
    });

    $scope.register = function () {
      return $state.go('register');
    };
  }); //-- end LoginCtrl
})();
'use strict';

(function () {
	'use strict';

	angular.module('app.controllers').controller('NotificationCtrl', function ($scope, UserService) {
		$scope.$on('$ionicView.enter', function () {
			var user = UserService.User();
			$scope.user = user;

			//-- Clear notifications on load
			angular.forEach(user.notifications, function (i, v) {
				if (!i.read) {
					i.read = true;
					console.log('setting ' + i.title + ' read to true');
				}
			});

			UserService.Update(user);
		});
	});
})();
'use strict';

(function () {
	'use strict';

	angular.module('app.controllers').controller('SettingsCtrl', function ($scope, UserService, $ionicPopup, $ionicHistory) {
		$scope.$on('$ionicView.enter', function () {
			$scope.user = UserService.User();
		});

		$scope.save = function () {
			UserService.Update($scope.user).then(function (data) {
				$ionicPopup.show({
					title: 'Message',
					template: 'Your changes have been saved.',
					buttons: [{ text: 'Continue' }]
				}); //-- end $ioonicPopup()
			});
		};

		$scope.cancel = function () {
			$ionicHistory.goBack();
		};
	});
})();
'use strict';

(function () {
	'use strict';

	angular.module('app.controllers').service('EventService', function () {
		var _latlng;
		var _events = [];

		var EventService = {
			Events: function Events(my_user) {
				if (my_user) _events = my_user['events'];

				return _events;
			},

			Latlng: function Latlng(my_latlng) {
				if (my_latlng) _latlng = my_latlng;

				return _latlng;
			},

			Owner: function Owner(my_user) {}
		};

		return EventService;
	});
})();
'use strict';

(function () {
	'use strict';

	angular.module('app.services').factory('MapService', function ($cordovaGeolocation, $state, $q, $ionicPopup) {
		var _map;
		var _mapboxToken = 'pk.eyJ1IjoiZGJvb3RzIiwiYSI6ImNpZnNpMDBiaTE5eDByM2tyMHU0emluZTcifQ.Hl7P6OXhqxBkTqJ0J99eVA';
		var _mapId = 'dboots.cifshzz181hx0s8m6kj4sjv7w';
		var _mapElement = 'map';

		var MapService = {
			Init: function Init() {
				var d = $q.defer();

				var options = { timeout: 100000, enableHighAccuracy: true };
				$cordovaGeolocation.getCurrentPosition(options).then(this.Success, this.Error).then(function (data) {
					d.resolve({
						map: data.map
					});
				});

				return d.promise;
			},

			Success: function Success(my_position) {
				var d = $q.defer();

				//--var user = UserService.User();

				L.mapbox.accessToken = _mapboxToken;
				_map = L.mapbox.map(_mapElement, _mapId, { 'minZoom': 12, 'maxZoom': 15 }).setView([my_position.coords.latitude, my_position.coords.longitude], 12);

				//--MapService.PlotEvents(user.events);

				d.resolve({
					map: _map
				});

				return d.promise;
			},

			PlotEvents: function PlotEvents(my_user) {
				var userEvents = my_user.events;
				var userFollowing = my_user.following;
				var latLng = {};

				//-- Plot User's own events
				for (var i = 0, len = userEvents.length; i < len; i++) {
					latLng = L.latLng(userEvents[i].latitude, userEvents[i].longitude);
					MapService.Circle(latLng, '#00FF00', userEvents[i]);
				}

				//-- Plot User's Following events
				for (var j = 0, userLen = userFollowing.length; j < userLen; j++) {
					var followingUserEvents = userFollowing[j].user !== null ? userFollowing[j].user.events : [];

					for (var k = 0, eventsLen = followingUserEvents.length; k < eventsLen; k++) {
						var evt = followingUserEvents[k];
						latLng = L.latLng(evt.latitude, evt.longitude);

						MapService.Circle(latLng, '#FF0000', evt);
					}
				}
			},

			Circle: function Circle(my_latLng, my_color, my_event) {
				//-- 1 mile = 1609.34 meters
				if (my_latLng) {
					var c = L.circle(my_latLng, 800, {
						stroke: false,
						color: my_color,
						fillOpacity: 0.8
					}).addTo(_map);

					c.on('click', function (e) {
						if (my_event._id) {
							$state.go('main.event', {
								'id': my_event._id
							});
						}
					});
				}
			},

			Error: function Error(err) {
				$ionicPopup.show({
					title: 'Error',
					template: 'code: ' + err.code + '<br />' + 'message: ' + err.message + '<br />trying again...',
					buttons: [{ text: 'Ok' }]
				}); //-- end $ionicPopup()

				MapService.Init();
			},

			Map: function Map() {
				var d = $q.defer();

				if (!_map) {
					MapService.Init().then(function (data) {
						_map = data.map;

						d.resolve({
							map: _map
						});
					});
				} else {
					d.resolve({
						map: _map
					});
				}

				return d.promise;
			},

			Remove: function Remove() {
				if (_map) {
					_map.remove();
					_map = null;
				}
			}
		};

		return MapService;
	});
})();
'use strict';

(function () {
  'use strict';

  angular.module('app.controllers').factory('LoginService', ['$global', '$http', 'rx', function ($global, $http, rx) {
    var loginUser = function loginUser(email, password) {
      return $http.post($global.config('api') + '/authenticate', {
        email: email,
        password: password
      });
    };
    return {
      loginUser: loginUser,
      rx_loginUser: function rx_loginUser(credentials) {
        return rx.Observable.fromPromise(loginUser(credentials.email, credentials.password))
        // catch HTTP errors and return a non-success object with a message
        .catch(function (e) {
          return rx.Observable.just({
            data: { message: "Service Issue" }
          });
        });
      }
    };
  }]);
})();
'use strict';

(function () {
	'use strict';

	angular.module('app.controllers').factory('RegisterService', ['$global', '$http', function ($global, $http) {
		return {
			registerUser: function registerUser(my_data) {
				return $http.post($global.config('api') + '/register', my_data);
			}
		};
	}]);
})();
'use strict';

(function () {
	'use strict';

	angular.module('app.controllers').factory('SearchService', function ($global, $http) {
		var SearchService = {
			Search: function Search(my_query, my_uid) {
				if (my_query) {
					return $http.get($global.config('api') + '/users', {
						params: {
							q: my_query,
							uid: my_uid,
							token: window.localStorage['token']
						}
					});
				}
			}
		};

		return SearchService;
	});
})();
'use strict';

(function () {
  'use strict';

  angular.module('app.controllers').factory('SocketService', ['$global', '$q', 'rx', function ($global) {

    var _rxSocket;

    var sharedSocket = function sharedSocket() {
      if (!_rxSocket) throw new Error("Socket must be initialized before use!");
      return _rxSocket;
    };

    var disconnectSharedSocket = function disconnectSharedSocket() {
      if (_rxSocket) _rxSocket.disconnect();
    };

    var initSharedSocket = function initSharedSocket(token) {
      var ioSocketSettings = {
        query: 'token=' + token,
        forceNew: true
      };
      _rxSocket = new RxSocket($global.config('server'), ioSocketSettings);
      return _rxSocket.connect();
    };

    return {
      sharedSocket: sharedSocket,
      initSharedSocket: initSharedSocket,
      disconnectSharedSocket: disconnectSharedSocket
    };
  }]);
})();
'use strict';

(function () {
	'use strict';

	angular.module('app.controllers').factory('UserService', function ($global, $http, SocketService) {
		var _user;

		var UserService = {
			login: function login(data) {
				if (data) {
					window.localStorage['token'] = data.data.token;
					_user = data.data.user;
				}

				return window.localStorage['token'];
			},

			logout: function logout() {
				window.localStorage['token'] = null;
				_user = null;

				SocketService.disconnectSharedSocket();
			},

			User: function User(my_user) {
				if (my_user) _user = my_user;

				return _user;
			},

			Follow: function Follow(my_followUserId) {
				return $http.post($global.config('api') + '/users/follow/' + _user._id, {
					followUserId: my_followUserId,
					token: window.localStorage['token']
				});
			},

			FollowApproval: function FollowApproval(my_followUserId, my_approval) {
				return $http.put($global.config('api') + '/users/follow/' + _user._id, {
					followUserId: my_followUserId,
					accepted: my_approval,
					token: window.localStorage['token']
				});
			},

			//-- TODO: Pull token from LocalStorage service
			Update: function Update(my_user) {
				if (my_user) {
					var user_id = my_user._id;
					return $http.put($global.config('api') + '/users/' + user_id, {
						user: my_user,
						token: window.localStorage['token']
					});
				}
			},

			AddEvent: function AddEvent(my_event) {
				if (my_event) {
					return $http.put($global.config('api') + '/users/' + _user._id + '/event', {
						eventObj: my_event,
						token: window.localStorage['token']
					});
				}
			},

			GetEvent: function GetEvent(my_eventId) {
				var evt = {};
				var events = _user['events'];

				for (var i = 0, len = events.length; i < len; i++) {
					if (events[i]['_id'] == my_eventId) evt = events[i];
				}

				return evt;
			}
		};

		return UserService;
	});
})();