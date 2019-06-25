import {
  WS_CONNECTION_ESTABLISHED,
  WS_CONNECTION_BEGIN,
  WS_CONNECTION_CLOSED,
  WS_CONNECTION_FAILED,
  CONNECTION_STATE_ON,
  CONNECTION_STATE_IN_PROGRESS,
  CONNECTION_STATE_OFF,
} from '../constants'


export const defaultConnectionState = {
  ws: 'ws://localhost:3012',
  isConnected: false,
  connectionState: CONNECTION_STATE_OFF,
}
export function connectionReducer(state = defaultConnectionState, action) {
  switch (action.type) {
    case WS_CONNECTION_BEGIN: {
      const retObj = { ...state }
      retObj.connectionState = CONNECTION_STATE_IN_PROGRESS
      return retObj
    }

    case WS_CONNECTION_ESTABLISHED: {
      const retObj = { ...state }
      retObj.isConnected = true
      retObj.connectionState = CONNECTION_STATE_ON
      return retObj
    }

    case WS_CONNECTION_CLOSED: {
      const retObj = { ...state }
      retObj.isConnected = false
      retObj.connectionState = CONNECTION_STATE_OFF
      return retObj
    }

    case WS_CONNECTION_FAILED: {
      const retObj = { ...state }
      retObj.isConnected = false
      retObj.connectionState = CONNECTION_STATE_OFF
      return retObj
    }

    default:
      return state
  }
}
