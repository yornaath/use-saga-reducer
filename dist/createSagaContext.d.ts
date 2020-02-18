import React from 'react';
import { RunSagaOptions } from 'redux-saga';
import { StrictEffect } from 'redux-saga/effects';
import { SagaStore } from './useSaga';
export declare const createSagaContext: <S, A>(reducer: (state: S, action: A) => S, initialState: S, saga: () => Iterator<StrictEffect<any, any>, any, undefined>, options?: Pick<RunSagaOptions<A, S>, "onError" | "sagaMonitor" | "context" | "effectMiddlewares"> | undefined) => {
    Provider: React.FC<{}>;
    use: () => SagaStore<S, A>;
};
