import React, { MutableRefObject } from 'react'
import { EventEmitter } from 'events'
import { unstable_ImmediatePriority, unstable_scheduleCallback } from 'scheduler'
import { Dispatch, useReducer, useRef, useEffect } from 'react'
import { runSaga, stdChannel, RunSagaOptions, Saga, channel } from 'redux-saga'
import {  } from '@redux-saga/types'

export type RunSaga = <RT> (saga: () => Generator<any, RT>) => Promise<RT>

export type SagaStore<S, A> = [S, Dispatch<A>, RunSaga]

export type SagaOptions<S, A> = Omit<RunSagaOptions<A, S>, 'channel' | 'dispatch' | 'getState' | 'onError'>

export const createSagaIO = <S, A> (
  stateRef: MutableRefObject<S>, 
  emitter: EventEmitter, 
  options?: SagaOptions<S, A>
) => {
  const channel = stdChannel<A>()
  const sagaOptions = options || {}

  const io = {
    channel,
    dispatch(action: A) {
      emitter.emit('output', action)
    },
    getState() {
      return stateRef.current
    },
    ...sagaOptions
  }

  return io
}

export type SagaIO = ReturnType<typeof createSagaIO>

export const useSaga = <S, A> (
  reducer: (state: S, action: A) => S,
  initialState: S,
  saga: Saga,
  options?: Omit<RunSagaOptions<A, S>, 'channel' | 'dispatch' | 'getState'>
): SagaStore<S, A> => {
  
  const emitter = useRef(new EventEmitter())
  const [reactState, reactDispatch] = useReducer(reducer, initialState)

  const stateRef = useRef<S>(reactState)
  const ioRef = useRef<SagaIO>()

  const getIO = () => {
    if(!ioRef.current)
      ioRef.current = createSagaIO(stateRef, emitter.current, options)
    return ioRef.current
  }
  
  stateRef.current = reactState

  useEffect(() => {
    
    const task = runSaga(getIO(), saga)

    const cancel = () => {
      emitter.current.removeAllListeners()
      task.cancel()
    }

    emitter.current.on('input', (action: A) => {
      unstable_scheduleCallback(unstable_ImmediatePriority, () => {
        getIO().channel.put(action)
      })
    })

    emitter.current.on('output', (action: A) => {
      unstable_scheduleCallback(unstable_ImmediatePriority, () => {
        getIO().channel.put(action)
        reactDispatch(action)
      })
    })

    return cancel
  }, [])

  const enhancedDispatch: Dispatch<A> = (action) => {
    reactDispatch(action)
    unstable_scheduleCallback(unstable_ImmediatePriority, () => {
      emitter.current.emit("input", action)
    })
    return action
  }

  const run: RunSaga = async (saga) => {
    const task = runSaga(getIO(), saga)
    const result = await task.toPromise()
    return result
  }

  return [reactState, enhancedDispatch, run]
}