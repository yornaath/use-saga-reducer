import React, { useEffect, useState, useRef } from 'react'
import { useSaga } from '../../../src'
import { takeEvery, select, delay, put } from 'redux-saga/effects'

const reducer = (count: number, action: any) => {
  switch(action.type) {
    case 'INCREMENT':
      return count + 1
    case 'DECREMENT':
      return count - 1
    case 'RESET_COUNT':
      return 0
  }
  return count
}

const resetAt = (max: number) => function*() {
  yield takeEvery('INCREMENT', function*() {
    const count = (yield select()) as number
    if(count >= max) {
      yield put({type: 'RESET_COUNT'})
    }
  })
}

export const Counter = (props: {max: number}) => {

  const [count, dispatch, run] = useSaga(reducer, 0, resetAt(props.max))
  const [cycle, setCycle] = useState(0)

  run(function* () {
    yield takeEvery('RESET_COUNT', function*() {
      console.log('cycling')
      setCycle( cycle +1 )
    })
  }, [cycle])

  return (
    <div>

      <button onClick={() => dispatch({type: 'INCREMENT'})}>+</button>
      <button onClick={() => dispatch({type: 'DECREMENT'})}>-</button>

      <div>counter: {count}</div>
      <div>cycle: {cycle}</div>

    </div>
  )
}