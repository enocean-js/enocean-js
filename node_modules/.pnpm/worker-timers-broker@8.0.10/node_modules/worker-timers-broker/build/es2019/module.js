import { createBroker } from 'broker-factory';
import { generateUniqueNumber } from 'fast-unique-numbers';
/*
 * @todo Explicitly referencing the barrel file seems to be necessary when enabling the
 * isolatedModules compiler option.
 */
export * from './interfaces/index';
export * from './types/index';
// Prefilling the Maps with a function indexed by zero is necessary to be compliant with the specification.
const scheduledIntervalsState = new Map([[0, null]]); // tslint:disable-line no-empty
const scheduledTimeoutsState = new Map([[0, null]]); // tslint:disable-line no-empty
export const wrap = createBroker({
    clearInterval: ({ call }) => {
        return (timerId) => {
            if (typeof scheduledIntervalsState.get(timerId) === 'symbol') {
                scheduledIntervalsState.set(timerId, null);
                call('clear', { timerId, timerType: 'interval' }).then(() => {
                    scheduledIntervalsState.delete(timerId);
                });
            }
        };
    },
    clearTimeout: ({ call }) => {
        return (timerId) => {
            if (typeof scheduledTimeoutsState.get(timerId) === 'symbol') {
                scheduledTimeoutsState.set(timerId, null);
                call('clear', { timerId, timerType: 'timeout' }).then(() => {
                    scheduledTimeoutsState.delete(timerId);
                });
            }
        };
    },
    setInterval: ({ call }) => {
        return (func, delay = 0, ...args) => {
            const symbol = Symbol();
            const timerId = generateUniqueNumber(scheduledIntervalsState);
            scheduledIntervalsState.set(timerId, symbol);
            const schedule = () => call('set', {
                delay,
                now: performance.timeOrigin + performance.now(),
                timerId,
                timerType: 'interval'
            }).then(() => {
                const state = scheduledIntervalsState.get(timerId);
                if (state === undefined) {
                    throw new Error('The timer is in an undefined state.');
                }
                if (state === symbol) {
                    func(...args);
                    // Doublecheck if the interval should still be rescheduled because it could have been cleared inside of func().
                    if (scheduledIntervalsState.get(timerId) === symbol) {
                        schedule();
                    }
                }
            });
            schedule();
            return timerId;
        };
    },
    setTimeout: ({ call }) => {
        return (func, delay = 0, ...args) => {
            const symbol = Symbol();
            const timerId = generateUniqueNumber(scheduledTimeoutsState);
            scheduledTimeoutsState.set(timerId, symbol);
            call('set', {
                delay,
                now: performance.timeOrigin + performance.now(),
                timerId,
                timerType: 'timeout'
            }).then(() => {
                const state = scheduledTimeoutsState.get(timerId);
                if (state === undefined) {
                    throw new Error('The timer is in an undefined state.');
                }
                if (state === symbol) {
                    // A timeout can be savely deleted because it is only called once.
                    scheduledTimeoutsState.delete(timerId);
                    func(...args);
                }
            });
            return timerId;
        };
    }
});
export const load = (url) => {
    const worker = new Worker(url);
    return wrap(worker);
};
//# sourceMappingURL=module.js.map