/// <reference types="react-dom/experimental" />
/// <reference types="react/experimental" />

import React, {
} from "react"
import ReactDOM from "react-dom"
import { Counter } from "./Counter"


const rootElement = document.getElementById("root")

ReactDOM.createRoot(rootElement).render(
  <div>

    <Counter max={5}/>
      
  </div>
)