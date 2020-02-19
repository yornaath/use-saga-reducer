/// <reference types="react-dom/experimental" />
/// <reference types="react/experimental" />

import React, {
} from "react"
import ReactDOM from "react-dom"
import UseSaga from "./UseSaga"
import UseGlobalSaga from "./UseGlobalSaga"


const rootElement = document.getElementById("root")

ReactDOM.createRoot(rootElement).render(
  <div>

    <div style={{marginBottom: 30}}>
      <UseSaga />
      <UseSaga />
    </div>

    <div style={{marginBottom: 30}}>

        <p>
          These share state
        </p>

      <UseGlobalSaga />
      
    </div>
  </div>
)