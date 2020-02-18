
# use-saga-reducer

Use redux-saga with react reducer hook, with convenience methods for running sagas from components.

### Example

#### store.ts
```typescript

import { take, put, delay, select, SelectEffect } from 'redux-saga/effects'

export type Ping = 'ping'
export type Pong = 'pong'

export type PingActionType = {
  type: Ping
}

export const ping = (): PingActionType => ({
  type: 'ping'
})

export type PongActionType = {
  type: Pong
}

export const pong = (): PongActionType => ({
  type: 'pong'
})

export type ActionType = 
    PingActionType
  | PongActionType

export type ActionEvent =
    Ping
  | Pong

export type State = {
  events: ActionEvent[]
  error?: string
}

export const reducer = (state: State, action: ActionType): State => {
  switch(action.type) {

    case 'ping':
      const isWaitingForPong = state.events[state.events.length - 1] === 'ping'

      if(isWaitingForPong)
        return { ...state, error: 'Invariant: trying to ping while ponging!'}

      return {
        events: [...state.events, 'ping']
      }

    case 'pong':
      const isWaitingForPing = state.events[state.events.length - 1] === 'pong'

      if(isWaitingForPing)
        return { ...state, error: 'Invariant: trying to pong while pinging!'}

      return {
        events: [...state.events, 'pong']
      }

  }
}

export const saga = function* saga() {
  while(yield take('ping')) {
    yield delay(800)
    yield put(pong())
  }
}
```


#### SimpleComponent.tsx
```typescript
import React from 'react'
import { useSaga } from 'use-saga-reducer'
import { useAsync } from 'react-use'
import { take, select } from 'redux-saga/effects'
import { reducer, saga, ping, State, ActionEvent } from './store'

const initialState: State = {
  events: []
}

const takePings = (until: number) => function* () {
  while(yield take('ping')) {

    const events = (yield select((s) => s.events)) as ActionEvent[]
    const nrOfPings = events.filter(e => e === 'ping').length    

    if(nrOfPings === until) 
      return "counting done"
  }
}

export default () => {

  const [state, dispatch, run] = useSaga(
    reducer, 
    initialState, 
    saga
  )

  const counted = useAsync(async () => {
    return await run(takePings(3))
  })

  return (
    <>

      <div style={{marginBottom: 10}}>
        <button onClick={() => dispatch(ping())}>Ping</button>
      </div>

      <div style={{marginBottom: 10}}>
        {state.events.map((event, index) => (
          <i key={index}>
            {event} {' '}
          </i>
        ))}
      </div>

      {
        state.error &&
          <b style={{color: 'orange'}}>{ state.error }</b>
      }

      
      <div style={{marginTop: 10}}>
        {
          counted.loading ?
            <b style={{color: 'orange'}}>counting..</b> :
          counted.value ?
            <b style={{color: 'green'}}>{ counted.value }</b> :
          "" 
        }
      </div>


    </>
  )
}
```

#### GlobalSagaReducer.tsx
```typescript
import React from 'react'
import { useSaga } from 'use-saga-reducer'
import { reducer, saga, ping, State } from './store'

const initialState: State = {
  events: []
}

const sagaContext = createSagaContext(reducer, initialState, saga)

export default () => {
  return (
    <sagaContext.Provider>

      <Inner />
      <Inner />
      <Inner />

    </sagaContext.Provider>
  )
}

export const Inner = () => {

  const [state, dispatch] = sagaContext.use()

  return (
    <>

      <div style={{marginBottom: 10}}>
        <button onClick={() => dispatch(ping())}>Ping</button>
      </div>

      <div style={{marginBottom: 10}}>
        {state.events.map((event, index) => (
          <i key={index}>
            {event} {' '}
          </i>
        ))}
      </div>

      {
        state.error &&
          <b style={{color: 'orange'}}>{ state.error }</b>
      }

    </>
  )
}
```