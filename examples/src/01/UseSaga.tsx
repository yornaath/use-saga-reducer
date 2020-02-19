import React from 'react'
import { useAsync } from 'react-use'
import { reducer, saga, ping, State, ActionEvent } from './store'
import { useSaga } from '../../../src'
import { take, select } from 'redux-saga/effects'

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
    return await run(takePings(4))
  }, [])

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