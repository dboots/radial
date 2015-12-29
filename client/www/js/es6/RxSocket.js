/**
 * A reactive wrapper around a socket.io socket.
 */
class RxSocket {
  constructor(endpoint, settings) {
    this.endpoint = endpoint;
    this.settings = settings;
  }
  connect() {
    let self = this; // not sure if this is needed in ecma6?
    return Rx.Observable.create( observer => {
      self.ioSocket = io.connect(self.endpoint, self.settings);
      self.ioSocket.on('connect', () => {
        observer.onNext();
        observer.onCompleted();
      });
      self.ioSocket.on('connect_error', e => {
        console.log('error');
        observer.onError(e);
      });
      self.ioSocket.on('connect_timeout', e => {
        console.log('timeout');
        observer.onError(e);
      });
    });
  }
  disconnect() {
    if(this.ioSocket) this.ioSocket.disconnect();
  }
  rx_on(method) {
    let self = this;
    return Rx.Observable.create( observer => {
      if(!self.ioSocket) {
        observer.onError("Socket not yet initialized!");
        return;
      }
      self.ioSocket.on(method, next => {
        observer.onNext(next);
      })
    });
  }
}
