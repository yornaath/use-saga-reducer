import React, { useContext, useMemo, useEffect } from 'react'
import hash from 'hash-sum'
import { createContext } from 'react'
import { RunSagaOptions } from 'redux-saga'
import { StrictEffect } from 'redux-saga/effects'
import { SagaStore, useSaga } from './useSaga'

export const createSagaContext = <S, A> (
  reducer: (state: S, action: A) => S,
  initialState: S,
  saga: () => Iterator<StrictEffect, any>,
  options?: Omit<RunSagaOptions<A, S>, 'channel' | 'dispatch' | 'getState'>
) => {

  const context = createContext<SagaStore<S, A> | null>(null)

  const Provider: React.FC = ({ children }) => {
    
    const [state, dispatch, run] = useSaga(reducer, initialState, saga, options)
    
    const stateHash = hash(state)

    const memoState = useMemo<S>(() => {
      return state
    }, [stateHash])

    const [memoDispatch, memoRun] = useMemo(() => {
      return [dispatch, run]
    }, [])

    return (
      <context.Provider value={[memoState, memoDispatch, memoRun]} children={children} />
    )
  }

  const use = () => {
    const sharedContext = useContext(context)
    if(!sharedContext)
      throw new Error('shared context can only be used within a <context.Provider>')
    return sharedContext
  }

  return {
    Provider,
    use
  }
}