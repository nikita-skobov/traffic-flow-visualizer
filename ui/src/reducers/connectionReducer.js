import {
  WS_CONNECTION_ESTABLISHED,
} from '../constants'


export const defaultConnectionState = {
  ws: 'ws://localhost:3012',
  isConnected: false,
}
export function connectionReducer(state = defaultConnectionState, action) {
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
