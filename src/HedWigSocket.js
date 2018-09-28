var HedWigSocket = (function () {
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Usage
 *
 * 1. Create
 *
 *      const url = 'wss://echo.websocket.org' --> test url
 *      const ws = new HedWigSocket(url)
 *
 * 2. Methods
 *
 *  2.1 subscribe
 *      ws.subscribe({
 *          onopen: function ,
 *          onmessage: function,
 *          onerror: function,
 *          onclose: function
 *      })
 *
 *      Or set a function , will call onmessage
 *      ws.subscribe((e)=>console.log(e.data))
 *
 *      return HedWigSocket Object
 *
 *  2.2 retry
 *      When ws state is closed and closed code != 1000 will do reconnect
 *
 *      ws.retry(count: Number,interval: Number)
 *
 *      retry(3, 1000) --> reconnect to server 3 times per second
 *
 *      retry(3) --> reconnect to server 3 times (interval default value is 5 seconds)
 *
 *      retry() --> reconnect to server until server response
 *
 *      return HedWigSocket Object
 *
 *  2.3 connect
 *
 *  2.4 disconnect
 *
 *  2.5 reconnect
 *
 *  2.6 send
 *
 *  2.7 readyState
 *      get ws state
 *
 *      const state = ws.readyState
 *
 *  2.8 heartBeat
 *      check ws still connect , if loss connection will call onclose
 *
 *      ws.heartBeat(interval: Number, message)
 *      interval--> default 30 seconds
 *
 *      ws.retry().heartBeat(3000,{
 *          comment: 'heartBeat'                 --> if loss connection , reconnect until server response
 *      })
 *
 *      ws.heartBeat()  --> if loss connection do nothing , readyState = CLOSED
 *
 *      return HedWigSocket Object
 */

/*
 *  connection status
 */
var CONNECTING = WebSocket.CONNECTING; // 0
var OPEN = WebSocket.OPEN; // 1
var CLOSING = WebSocket.CLOSING; // 2
var CLOSED = WebSocket.CLOSED; // 3

/*
 *  private functions
 */
var initWebsocketEvent = Symbol("initWebsocketEvent");
var clearTimer = Symbol("clearTimer");
var doRetry = Symbol("doRetry");
var doHeartCheck = Symbol("doHeartCheck");
var EMPTY_FUNCTION = function EMPTY_FUNCTION() {};

var HedWigSocket = function () {
  function HedWigSocket(url) {
    _classCallCheck(this, HedWigSocket);

    this.url = url;
    this.ws = null;
    this.wsState = CLOSED;
    this.timer = null;
    this.retryConfig = {
      count: 0,
      interval: 5000,
      tried: 0
    };
    this.heartBeatConfig = {
      doCheck: false,
      timeout: null,
      message: null,
      timeoutObj: null,
      serverTimeoutObj: null
    };
    this.listener = {
      onopen: EMPTY_FUNCTION,
      onmessage: EMPTY_FUNCTION,
      onerror: EMPTY_FUNCTION,
      onclose: EMPTY_FUNCTION
    };
  }

  HedWigSocket.prototype[clearTimer] = function () {
    clearInterval(this.timer);
    this.timer = null;
  };

  HedWigSocket.prototype[initWebsocketEvent] = function () {
    var _this = this;

    this.ws.onopen = function (e) {
      _this.retryConfig.tried = 0;
      _this.wsState = OPEN;
      _this.listener.onopen(e);
      if (_this.heartBeatConfig.doCheck) _this[doHeartCheck]().start();
    };
    this.ws.onmessage = function (e) {
      _this.listener.onmessage(e);
      if (_this.heartBeatConfig.doCheck) _this[doHeartCheck]().reset().start();
    };

    this.ws.onerror = this.listener.onerror;

    this.ws.onclose = function (e) {
      _this.wsState = CLOSED;
      _this[clearTimer]();
      _this.ws = null;
      _this.listener.onclose(e);
      if (_this.heartBeatConfig.doCheck) _this[doHeartCheck]().reset();
      if (_this.retryConfig.count !== 0 && e.code !== 1000) _this[doRetry]();
    };
  };

  HedWigSocket.prototype[doRetry] = function () {
    var _retryConfig = this.retryConfig,
        count = _retryConfig.count,
        interval = _retryConfig.interval,
        tried = _retryConfig.tried;

    if (!count) {
      this.reconnect(interval);
      return;
    }
    if (this.wsState !== WebSocket.OPEN && tried < count - 1) {
      this.reconnect(interval);
      this.retryConfig.tried += 1;
    } else {
      this.retryConfig.tried = 0;
    }
  };

  HedWigSocket.prototype[doHeartCheck] = function () {
    var self = this;
    var _heartBeatConfig = this.heartBeatConfig,
        timeout = _heartBeatConfig.timeout,
        message = _heartBeatConfig.message;

    return {
      reset: function reset() {
        clearTimeout(self.heartBeatConfig.timeoutObj);
        clearTimeout(self.heartBeatConfig.serverTimeoutObj);
        return this;
      },
      start: function start() {
        self.heartBeatConfig.timeoutObj = setTimeout(function () {
          self.send(message);
          self.heartBeatConfig.serverTimeoutObj = setTimeout(function () {
            self.disconnect(4000, "Loss connection");
          }, 10000);
        }, timeout);
      }
    };
  };

  HedWigSocket.prototype.subscribe = function subscribe(options) {
    if (typeof options === "function") {
      this.listener.onmessage = options;
    } else {
      this.listener = Object.assign(this.listener, options);
    }
    return this;
  };

  HedWigSocket.prototype.connect = function connect() {
    if (this.wsState !== CLOSED) {
      throw new Error("Connection is busy, please try again later.");
    }
    this.wsState = CONNECTING;
    this.ws = new WebSocket(this.url);
    this[initWebsocketEvent]();
    return this;
  };

  HedWigSocket.prototype.disconnect = function disconnect() {
    var code = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1000;
    var reason = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "Normal closure";

    if (code && !code === 1000 || code >= 4999 && code <= 3000) {
      throw new Error("Invalid code");
    }
    if (this.ws !== null && this.wsState === OPEN) {
      this.wsState = CLOSING;
      var wasClean = true;
      this.retryConfig.tried = 0;
      this.ws.close(code, reason, wasClean);
    } else {
      throw new Error("Connection has already been closed");
    }
  };

  HedWigSocket.prototype.reconnect = function reconnect() {
    var _this2 = this;

    var interval = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 5000;

    if (typeof this.timer !== "undefined" || this.timer !== null) {
      this[clearTimer]();
    }
    this.timer = setInterval(function () {
      if (_this2.wsState === CLOSED) {
        _this2.connect();
      }
    }, interval);
  };

  HedWigSocket.prototype.retry = function retry(count) {
    var interval = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 5000;

    if (count < 0) {
      throw new Error("Retry count must not be less than 0");
    }
    this.retryConfig = Object.assign(this.retryConfig, { count: count, interval: interval });
    return this;
  };

  HedWigSocket.prototype.heartBeat = function heartBeat() {
    var timeout = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 30000;
    var message = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : { command: "ping" };

    this.heartBeatConfig = {
      doCheck: true,
      timeout: timeout,
      message: message
    };
    return this;
  };

  HedWigSocket.prototype.send = function send(data) {
    if (this.readyState === CONNECTING) {
      throw new Error("The connection has not been established yet");
    }
    if (this.readyState !== OPEN) {
      return;
    }
    if ((typeof data === "undefined" ? "undefined" : _typeof(data)) === "object") {
      data = JSON.stringify(data);
    }
    this.ws.send(data);
  };

  _createClass(HedWigSocket, [{
    key: "readyState",
    get: function get() {
      return this.wsState;
    }
  }]);

  return HedWigSocket;
}();

return HedWigSocket;

}());
//# sourceMappingURL=bundle.js.map
