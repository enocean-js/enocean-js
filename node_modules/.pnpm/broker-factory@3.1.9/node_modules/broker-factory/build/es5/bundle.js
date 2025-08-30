(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@babel/runtime/helpers/defineProperty'), require('@babel/runtime/helpers/slicedToArray'), require('fast-unique-numbers'), require('@babel/runtime/helpers/asyncToGenerator'), require('@babel/runtime/regenerator')) :
    typeof define === 'function' && define.amd ? define(['exports', '@babel/runtime/helpers/defineProperty', '@babel/runtime/helpers/slicedToArray', 'fast-unique-numbers', '@babel/runtime/helpers/asyncToGenerator', '@babel/runtime/regenerator'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.brokerFactory = {}, global._defineProperty, global._slicedToArray, global.fastUniqueNumbers, global._asyncToGenerator, global._regeneratorRuntime));
})(this, (function (exports, _defineProperty, _slicedToArray, fastUniqueNumbers, _asyncToGenerator, _regeneratorRuntime) { 'use strict';

    var isMessagePort = function isMessagePort(sender) {
      return typeof sender.start === 'function';
    };

    var PORT_MAP = new WeakMap();

    function ownKeys$1(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
    function _objectSpread$1(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys$1(Object(t), true).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$1(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
    var extendBrokerImplementation = function extendBrokerImplementation(partialBrokerImplementation) {
      return _objectSpread$1(_objectSpread$1({}, partialBrokerImplementation), {}, {
        connect: function connect(_ref) {
          var call = _ref.call;
          return /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regeneratorRuntime.mark(function _callee() {
            var _MessageChannel, port1, port2, portId;
            return _regeneratorRuntime.wrap(function (_context) {
              while (1) switch (_context.prev = _context.next) {
                case 0:
                  _MessageChannel = new MessageChannel(), port1 = _MessageChannel.port1, port2 = _MessageChannel.port2;
                  _context.next = 1;
                  return call('connect', {
                    port: port1
                  }, [port1]);
                case 1:
                  portId = _context.sent;
                  PORT_MAP.set(port2, portId);
                  return _context.abrupt("return", port2);
                case 2:
                case "end":
                  return _context.stop();
              }
            }, _callee);
          }));
        },
        disconnect: function disconnect(_ref3) {
          var call = _ref3.call;
          return /*#__PURE__*/function () {
            var _ref4 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime.mark(function _callee2(port) {
              var portId;
              return _regeneratorRuntime.wrap(function (_context2) {
                while (1) switch (_context2.prev = _context2.next) {
                  case 0:
                    portId = PORT_MAP.get(port);
                    if (!(portId === undefined)) {
                      _context2.next = 1;
                      break;
                    }
                    throw new Error('The given port is not connected.');
                  case 1:
                    _context2.next = 2;
                    return call('disconnect', {
                      portId: portId
                    });
                  case 2:
                  case "end":
                    return _context2.stop();
                }
              }, _callee2);
            }));
            return function (_x) {
              return _ref4.apply(this, arguments);
            };
          }();
        },
        isSupported: function isSupported(_ref5) {
          var call = _ref5.call;
          return function () {
            return call('isSupported');
          };
        }
      });
    };

    function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
    function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), true).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
    var ONGOING_REQUESTS = new WeakMap();
    var createOrGetOngoingRequests = function createOrGetOngoingRequests(sender) {
      if (ONGOING_REQUESTS.has(sender)) {
        // @todo TypeScript needs to be convinced that has() works as expected.
        return ONGOING_REQUESTS.get(sender);
      }
      var ongoingRequests = new Map();
      ONGOING_REQUESTS.set(sender, ongoingRequests);
      return ongoingRequests;
    };
    var createBroker = function createBroker(brokerImplementation) {
      var fullBrokerImplementation = extendBrokerImplementation(brokerImplementation);
      return function (sender) {
        var ongoingRequests = createOrGetOngoingRequests(sender);
        sender.addEventListener('message', function (_ref) {
          var message = _ref.data;
          var id = message.id;
          if (id !== null && ongoingRequests.has(id)) {
            var _ongoingRequests$get = ongoingRequests.get(id),
              reject = _ongoingRequests$get.reject,
              resolve = _ongoingRequests$get.resolve;
            ongoingRequests["delete"](id);
            if (message.error === undefined) {
              resolve(message.result);
            } else {
              reject(new Error(message.error.message));
            }
          }
        });
        if (isMessagePort(sender)) {
          sender.start();
        }
        var call = function call(method) {
          var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
          var transferables = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
          return new Promise(function (resolve, reject) {
            var id = fastUniqueNumbers.generateUniqueNumber(ongoingRequests);
            ongoingRequests.set(id, {
              reject: reject,
              resolve: resolve
            });
            if (params === null) {
              sender.postMessage({
                id: id,
                method: method
              }, transferables);
            } else {
              sender.postMessage({
                id: id,
                method: method,
                params: params
              }, transferables);
            }
          });
        };
        var notify = function notify(method, params) {
          var transferables = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
          sender.postMessage({
            id: null,
            method: method,
            params: params
          }, transferables);
        };
        var functions = {};
        for (var _i = 0, _Object$entries = Object.entries(fullBrokerImplementation); _i < _Object$entries.length; _i++) {
          var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
            key = _Object$entries$_i[0],
            handler = _Object$entries$_i[1];
          functions = _objectSpread(_objectSpread({}, functions), {}, _defineProperty({}, key, handler({
            call: call,
            notify: notify
          })));
        }
        return _objectSpread({}, functions);
      };
    };

    exports.createBroker = createBroker;

}));
