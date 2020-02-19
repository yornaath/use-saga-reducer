import React from 'react';
import { EventEmitter } from 'events';
import { Dispatch } from 'react';
import { AsyncState } from 'react-use/esm/useAsync';
import { RunSagaOptions, Saga } from 'redux-saga';
export declare type UseRun = <Returns>(saga: () => Generator<any, Returns>, deps?: any[]) => AsyncState<Returns>;
export declare type SagaStore<State, Action> = [State, Dispatch<Action>, UseRun];
export declare type SagaOptions<State, Action> = Omit<RunSagaOptions<Action, State>, 'channel' | 'dispatch' | 'getState' | 'onError'>;
export declare type SagaIO = ReturnType<typeof createSagaIO>;
export declare const useSaga: <State, Action>(reducer: (state: State, action: Action) => State, initialState: State, saga: Saga<any[]>, options?: Pick<RunSagaOptions<Action, State>, "onError" | "sagaMonitor" | "context" | "effectMiddlewares"> | undefined) => SagaStore<State, Action>;
declare const createSagaIO: <State, Action>(stateRef: React.MutableRefObject<State>, emitter: EventEmitter, options?: Pick<RunSagaOptions<Action, State>, "sagaMonitor" | "context" | "effectMiddlewares"> | undefined) => {
    sagaMonitor?: import("redux-saga").SagaMonitor | undefined;
    context?: object | undefined;
    effectMiddlewares?: import("redux-saga").EffectMiddleware[] | undefined;
    channel: import("redux-saga").MulticastChannel<Action>;
    dispatch(action: Action): void;
    getState(): State;
};
export {};
