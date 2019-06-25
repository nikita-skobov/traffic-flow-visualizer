import React, { Component } from 'react'
import { connect } from 'react-redux'

import TrafficDisplayPyramid from './TrafficDisplayPyramid'
import Connecter from './Connector'
// purposefully spelled wrong to use the default
// export instead of the named export

function Connected() {
  return <TrafficDisplayPyramid />
}

function NotConnectedYet(props) {
  const { ws } = props
  return (
    <div className="container h-100">
      <div className="row h-100">
        <div className="col-sm-12 my-auto">
          <div className="card card-block w-25 mx-auto">
            <Connecter ws={ws} />
          </div>
        </div>
      </div>
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
