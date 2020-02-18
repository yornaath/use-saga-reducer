"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var hash_sum_1 = __importDefault(require("hash-sum"));
var react_2 = require("react");
var useSaga_1 = require("./useSaga");
exports.createSagaContext = function (reducer, initialState, saga, options) {
    var context = react_2.createContext(null);
    var Provider = function (_a) {
        var children = _a.children;
        var _b = useSaga_1.useSaga(reducer, initialState, saga, options), state = _b[0], dispatch = _b[1], run = _b[2];
        var stateHash = hash_sum_1.default(state);
        var memoState = react_1.useMemo(function () {
            return state;
        }, [stateHash]);
        var _c = react_1.useMemo(function () {
            return [dispatch, run];
        }, []), memoDispatch = _c[0], memoRun = _c[1];
        return (react_1.default.createElement(context.Provider, { value: [memoState, memoDispatch, memoRun], children: children }));
    };
    var use = function () {
        var sharedContext = react_1.useContext(context);
        if (!sharedContext)
            throw new Error('shared context can only be used within a <context.Provider>');
        return sharedContext;
    };
    return {
        Provider: Provider,
        use: use
    };
};
