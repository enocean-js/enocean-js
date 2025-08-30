(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@babel/runtime/helpers/typeof'), require('broker-factory'), require('fast-unique-numbers')) :
    typeof define === 'function' && define.amd ? define(['exports', '@babel/runtime/helpers/typeof', 'broker-factory', 'fast-unique-numbers'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.workerTimersBroker = {}, global._typeof, global.brokerFactory, global.fastUniqueNumbers));
})(this, (function (exports, _typeof, brokerFactory, fastUniqueNumbers) { 'use strict';

    // Prefilling the Maps with a function indexed by zero is necessary to be compliant with the specification.
    var scheduledIntervalsState = new Map([[0, null]]); // tslint:disable-line no-empty
    var scheduledTimeoutsState = new Map([[0, null]]); // tslint:disable-line no-empty
    var wrap = brokerFactory.createBroker({
      clearInterval: function clearInterval(_ref) {
        var call = _ref.call;
        return function (timerId) {
          if (_typeof(scheduledIntervalsState.get(timerId)) === 'symbol') {
            scheduledIntervalsState.set(timerId, null);
            call('clear', {
              timerId: timerId,
              timerType: 'interval'
            }).then(function () {
              scheduledIntervalsState["delete"](timerId);
            });
          }
        };
      },
      clearTimeout: function clearTimeout(_ref2) {
        var call = _ref2.call;
        return function (timerId) {
          if (_typeof(scheduledTimeoutsState.get(timerId)) === 'symbol') {
            scheduledTimeoutsState.set(timerId, null);
            call('clear', {
              timerId: timerId,
              timerType: 'timeout'
            }).then(function () {
              scheduledTimeoutsState["delete"](timerId);
            });
          }
        };
      },
      setInterval: function setInterval(_ref3) {
        var call = _ref3.call;
        return function (func) {
          var delay = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
          for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
            args[_key - 2] = arguments[_key];
          }
          var symbol = Symbol();
          var timerId = fastUniqueNumbers.generateUniqueNumber(scheduledIntervalsState);
          scheduledIntervalsState.set(timerId, symbol);
          var _schedule = function schedule() {
            return call('set', {
              delay: delay,
              now: performance.timeOrigin + performance.now(),
              timerId: timerId,
              timerType: 'interval'
            }).then(function () {
              var state = scheduledIntervalsState.get(timerId);
              if (state === undefined) {
                throw new Error('The timer is in an undefined state.');
              }
              if (state === symbol) {
                func.apply(void 0, args);
                // Doublecheck if the interval should still be rescheduled because it could have been cleared inside of func().
                if (scheduledIntervalsState.get(timerId) === symbol) {
                  _schedule();
                }
              }
            });
          };
          _schedule();
          return timerId;
        };
      },
      setTimeout: function setTimeout(_ref4) {
        var call = _ref4.call;
        return function (func) {
          var delay = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
          for (var _len2 = arguments.length, args = new Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
            args[_key2 - 2] = arguments[_key2];
          }
          var symbol = Symbol();
          var timerId = fastUniqueNumbers.generateUniqueNumber(scheduledTimeoutsState);
          scheduledTimeoutsState.set(timerId, symbol);
          call('set', {
            delay: delay,
            now: performance.timeOrigin + performance.now(),
            timerId: timerId,
            timerType: 'timeout'
          }).then(function () {
            var state = scheduledTimeoutsState.get(timerId);
            if (state === undefined) {
              throw new Error('The timer is in an undefined state.');
            }
            if (state === symbol) {
              // A timeout can be savely deleted because it is only called once.
              scheduledTimeoutsState["delete"](timerId);
              func.apply(void 0, args);
            }
          });
          return timerId;
        };
      }
    });
    var load = function load(url) {
      var worker = new Worker(url);
      return wrap(worker);
    };

    exports.load = load;
    exports.wrap = wrap;

}));
