import React from 'react'
import ReactDOM from 'react-dom'
import { Dapp } from './components/Dapp'
import { ToastProvider, useToasts } from 'react-toast-notifications'

// We import bootstrap here, but you can remove if you want
import 'bootstrap/dist/css/bootstrap.min.css'

// This is the entry point of your application, but it just renders the Dapp
// react component. All of the logic is contained in it.

function Scaffold() {
  const toasts = useToasts()
  return <Dapp {...toasts} />
}
function App() {
  return (
    <ToastProvider autoDismiss={true}>
      <Scaffold />
    </ToastProvider>
  )
}
ReactDOM.render(<App />, document.getElementById('root'))
