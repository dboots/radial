(function () {
	'use strict';

	angular.module('app.controllers')
		.factory('SocketService', ['$global', '$q', 'rx', ($global) => {
      let _rxSocket;

      let sharedSocket = () => {
        if(!_rxSocket) throw new Error ("Socket must be initialized before use!");
        return _rxSocket;
      };

      let disconnectSharedSocket = () => {
        if(_rxSocket) _rxSocket.disconnect();
      };

      let initSharedSocket = token => {
        let ioSocketSettings = {
          query: 'token=' + token,
          forceNew: true
        };
        _rxSocket = new RadialSocket($global.config('server'), ioSocketSettings);
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
