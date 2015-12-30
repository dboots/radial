(function () {
	'use strict';

	angular.module('app.controllers')
		.factory('SearchService', function($global, $http, rx) {
      let search = (my_query, my_uid) => {
        if (my_query) {
          return $http.get($global.config('api') + '/users', {
            params: {
              q: my_query,
              uid: my_uid,
              token: window.localStorage['token']
            }
          });
        }
      };

			return {
        Search: search,
        rx_search: (my_query, my_uid) =>
          rx.Observable.fromPromise(search(my_query, my_uid))
            .retry(5)
            .catch(e => rx.Observable.just([]))
      };
		});
}());
