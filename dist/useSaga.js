"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var events_1 = require("events");
var scheduler_1 = require("scheduler");
var react_1 = require("react");
var useAsync_1 = __importDefault(require("react-use/esm/useAsync"));
var redux_saga_1 = require("redux-saga");
exports.createSagaIO = function (stateRef, emitter, options) {
    var channel = redux_saga_1.stdChannel();
    var sagaOptions = options || {};
    var io = __assign({ channel: channel,
        dispatch: function (action) {
            emitter.emit('output', action);
        },
        getState: function () {
            return stateRef.current;
        } }, sagaOptions);
    return io;
};
exports.useSaga = function (reducer, initialState, saga, options) {
    var emitter = react_1.useRef(new events_1.EventEmitter());
    var _a = react_1.useReducer(reducer, initialState), reactState = _a[0], reactDispatch = _a[1];
    var stateRef = react_1.useRef(reactState);
    var ioRef = react_1.useRef();
    var getIO = function () {
        if (!ioRef.current)
            ioRef.current = exports.createSagaIO(stateRef, emitter.current, options);
        return ioRef.current;
    };
    stateRef.current = reactState;
    react_1.useEffect(function () {
        var task = redux_saga_1.runSaga(getIO(), saga);
        var cancel = function () {
            emitter.current.removeAllListeners();
            task.cancel();
        };
        emitter.current.on('input', function (action) {
            scheduler_1.unstable_scheduleCallback(scheduler_1.unstable_ImmediatePriority, function () {
                getIO().channel.put(action);
            });
        });
        emitter.current.on('output', function (action) {
            scheduler_1.unstable_scheduleCallback(scheduler_1.unstable_ImmediatePriority, function () {
                getIO().channel.put(action);
                reactDispatch(action);
            });
        });
        return cancel;
    }, []);
    var enhancedDispatch = function (action) {
        reactDispatch(action);
        scheduler_1.unstable_scheduleCallback(scheduler_1.unstable_ImmediatePriority, function () {
            emitter.current.emit("input", action);
        });
        return action;
    };
    var useRun = function (saga, deps) {
        if (deps === void 0) { deps = []; }
        var canceled = false;
        var resolve;
        var reject;
        var promise = new Promise(function (_resolve, _reject) {
            resolve = _resolve;
            reject = _reject;
        });
        react_1.useEffect(function () {
            var task = redux_saga_1.runSaga(getIO(), saga);
            task.toPromise()
                .then(function (value) {
                if (!canceled)
                    resolve(value);
            })
                .catch(function (error) {
                if (!canceled)
                    reject(error);
            });
            return function () {
                canceled = true;
                task.cancel();
            };
        }, deps);
        return useAsync_1.default(function () { return promise; }, deps);
    };
    return [reactState, enhancedDispatch, useRun];
};
