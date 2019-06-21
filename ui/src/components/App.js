import React, { Component } from 'react'
import { connect } from 'react-redux'

import Connecter from './Connector'
// purposefully spelled wrong to use the default
// export instead of the named export

function Connected() {
  return (
    <div>
      Connected!
    </div>
  )
}

function NotConnectedYet(props) {
  const { ws } = props
  return (
    <div>
      <Connecter ws={ws} />
    </div>
  )
}

export function App(props) {
  console.log(props)

  const {
    isConnected,
    ws,
  } = props

  if (isConnected) {
    return <Connected />
  }

  return <NotConnectedYet ws={ws} />
}

const mapStateToProps = (state, ownProps) => {
  const appState = {
    isConnected: state.connectionReducer.isConnected,
    ws: state.connectionReducer.ws,
  }

  return appState
}

export default connect(mapStateToProps)(App)
