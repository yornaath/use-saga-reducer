import React, { useEffect } from 'react'
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
      console.log('resetting count')
      yield delay(1400)
      yield put({type: 'RESET_COUNT'})
    }
  })
}

export const Counter = (props: {max: number}) => {

  const [count, dispatch, run] = useSaga(reducer, 0, resetAt(props.max))

  useEffect(() => {
    run(function* () {
      yield takeEvery('RESET_COUNT', function*(a) {
        console.log('count reseted')
      })
    })
  }, [])

  return (
    <div>

      <button onClick={() => dispatch({type: 'INCREMENT'})}>+</button>
      <button onClick={() => dispatch({type: 'DECREMENT'})}>-</button>

      <div>{count}</div>

    </div>
  )
}