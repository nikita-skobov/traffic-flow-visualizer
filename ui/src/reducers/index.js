import { combineReducers } from 'redux'

import {
  WS_CONNECTION_ESTABLISHED,
} from '../constants'

function sampleReducer(state = {}, action) {
  switch (action.type) {
    default:
      return state
  }
}

const defaultConnectionState = {
  ws: 'ws://localhost:3012',
  isConnected: false,
}
function connectionReducer(state = defaultConnectionState, action) {
  switch (action.type) {
    case WS_CONNECTION_ESTABLISHED: {
      const retObj = { ...state }
      retObj.isConnected = true
      return retObj
    }

    default:
      return state
  }
}


export default combineReducers({
  sampleReducer,
  connectionReducer,
})
