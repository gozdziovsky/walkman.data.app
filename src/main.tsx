import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css' // <--- CZY TO TU JEST?

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
