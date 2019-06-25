import { combineReducers } from 'redux'

import { connectionReducer, defaultConnectionState } from './connectionReducer'
import { trafficReducer, defaultTrafficState } from './trafficReducer'

export default combineReducers({
  connectionReducer,
  trafficReducer,
})

export const defaultState = {
  connectionReducer: defaultConnectionState,
  trafficReducer: defaultTrafficState,
}
