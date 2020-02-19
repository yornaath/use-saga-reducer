import React, { MutableRefObject } from 'react'
import { EventEmitter } from 'events'
import { unstable_ImmediatePriority, unstable_scheduleCallback } from 'scheduler'
import { Dispatch, useReducer, useRef, useEffect } from 'react'
import useAsync, { AsyncState } from 'react-use/esm/useAsync'
import { runSaga, stdChannel, RunSagaOptions, Saga } from 'redux-saga'

export type UseRun = <Returns> (saga: () => Generator<any, Returns>, deps?: any[]) => AsyncState<Returns>
export type SagaStore<State, Action> = [State, Dispatch<Action>, UseRun]
export type SagaOptions<State, Action> = Omit<RunSagaOptions<Action, State>, 'channel' | 'dispatch' | 'getState' | 'onError'>
export type SagaIO = ReturnType<typeof createSagaIO>

export const useSaga = <State, Action> (
  reducer: (state: State, action: Action) => State,
  initialState: State,
  saga: Saga,
  options?: Omit<RunSagaOptions<Action, State>, 'channel' | 'dispatch' | 'getState'>
): SagaStore<State, Action> => {
  
  const emitter = useRef(new EventEmitter())
  const [reactState, reactDispatch] = useReducer(reducer, initialState)

  const stateRef = useRef<State>(reactState)
  const ioRef = useRef<SagaIO>()

  stateRef.current = reactState

  const getIO = () => {
    if(!ioRef.current)
      ioRef.current = createSagaIO(stateRef, emitter.current, options)
    return ioRef.current
  }
  
  useEffect(() => {
    
    const task = runSaga(getIO(), saga)

    emitter.current.on('input', (action: Action) => {
      unstable_scheduleCallback(unstable_ImmediatePriority, () => {
        getIO().channel.put(action)
      })
    })

    emitter.current.on('output', (action: Action) => {
      unstable_scheduleCallback(unstable_ImmediatePriority, () => {
        getIO().channel.put(action)
        reactDispatch(action)
      })
    })

    const cancel = () => {
      emitter.current.removeAllListeners()
      task.cancel()
    }

    return cancel
  }, [])

  const enhancedDispatch: Dispatch<Action> = (action) => {
    reactDispatch(action)
    unstable_scheduleCallback(unstable_ImmediatePriority, () => {
      emitter.current.emit("input", action)
    })
    return action
  }

  const useRun: UseRun = (saga, deps = []) => {

    let canceled = false
    let resolve: (value?: any) => void
    let reject: (value?: any) => void

    const promise = new Promise<any>((_resolve, _reject) => {
      resolve = _resolve
      reject = _reject
    })

    useEffect(() => {
      const task = runSaga(getIO(), saga)
      task.toPromise()
        .then((value) => {
          if(!canceled) resolve(value)
        })
        .catch((error) => {
          if(!canceled) reject(error)
        })
      return () => {
        canceled = true
        task.cancel()
      }
    }, deps)

    return useAsync(() => promise, deps)
  }

  return [reactState, enhancedDispatch, useRun]
}

const createSagaIO = <State, Action> (
  stateRef: MutableRefObject<State>, 
  emitter: EventEmitter, 
  options?: SagaOptions<State, Action>
) => {

  const channel = stdChannel<Action>()
  const sagaOptions = options || {}

  return {
    channel,
    dispatch(action: Action) {
      emitter.emit('output', action)
    },
    getState() {
      return stateRef.current
    },
    ...sagaOptions
  }
}