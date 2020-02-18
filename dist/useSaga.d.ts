import React from 'react';
import { Dispatch } from 'react';
import { RunSagaOptions, Saga } from 'redux-saga';
export declare type RunSaga = <RT>(saga: () => Generator<any, RT>) => Promise<RT>;
export declare type SagaStore<S, A> = [S, Dispatch<A>, RunSaga];
export declare type SagaOptions<S, A> = Omit<RunSagaOptions<A, S>, 'channel' | 'dispatch' | 'getState' | 'onError'>;
export declare const createSagaIO: <S, A>(dispatch: React.Dispatch<A>, stateRef: React.MutableRefObject<S>, options?: Pick<RunSagaOptions<A, S>, "sagaMonitor" | "context" | "effectMiddlewares"> | undefined) => {
    sagaMonitor?: import("redux-saga").SagaMonitor | undefined;
    context?: object | undefined;
    effectMiddlewares?: import("redux-saga").EffectMiddleware[] | undefined;
    channel: import("redux-saga").MulticastChannel<A>;
    dispatch(action: A): void;
    getState(): S;
};
export declare type SagaIO = ReturnType<typeof createSagaIO>;
export declare const useSaga: <S, A>(reducer: (state: S, action: A) => S, initialState: S, saga: Saga<any[]>, options?: Pick<RunSagaOptions<A, S>, "onError" | "sagaMonitor" | "context" | "effectMiddlewares"> | undefined) => SagaStore<S, A>;
