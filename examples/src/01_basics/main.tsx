/// <reference types="react-dom/experimental" />
/// <reference types="react/experimental" />

import React, { useState, useRef, useEffect } from "react"
import hashSum from 'hash-sum'
import ReactDOM from "react-dom"
import UseSaga from "./UseSaga"
import UseGlobalSaga from "./UseGlobalSaga"

const Refresher: React.FC = (props) => {
  const [frame, setFrame] = useState(0)

  useEffect(() => {
    setTimeout(()=> setFrame(frame+1), 33)
  }, [frame])

  const hash = hashSum(frame)

  return (
    <div>
    
      <div>

        <div style={{marginBottom: 30}}>

          <p>
            These have individual state
          </p>

          <UseSaga frame={hash}/>
          <UseSaga frame={hash}/>

        </div>

          <div style={{marginBottom: 30}}>

            <p>
              These share state
            </p>

            <UseGlobalSaga />
            
        </div>
      </div>

      <div style={{border: '1px solid gray', padding: 10, marginTop: 20}}>
        frame: {frame}
      </div>

    </div>
  )
}

const rootElement = document.getElementById("root")

ReactDOM.createRoot(rootElement).render(
  <div>
    <Refresher />
  </div>
)