
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

export const selectState = <T> (selector: (s:State) => T): SelectEffect => {
  return select(selector)
}