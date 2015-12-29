(function () {
	'use strict';

	angular.module('app.controllers')
		.factory('SocketService', ['$global', '$q', 'rx', function($global) {

      var _rxSocket;

      var sharedSocket = function() {
        if(!_rxSocket) throw new Error ("Socket must be initialized before use!");
        return _rxSocket;
      };

      var disconnectSharedSocket = function() {
        if(_rxSocket) _rxSocket.disconnect();
      };

      var initSharedSocket = function(token) {
        var ioSocketSettings = {
          query: 'token=' + token,
          forceNew: true
        };
        _rxSocket = new RxSocket($global.config('server'), ioSocketSettings);
        return _rxSocket.connect();
      };

			return {
        sharedSocket:sharedSocket,
				initSharedSocket: initSharedSocket,
        disconnectSharedSocket:disconnectSharedSocket
			};
		}]
	);
}());
