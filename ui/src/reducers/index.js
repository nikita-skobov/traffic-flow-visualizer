import { combineReducers } from 'redux'

import { connectionReducer } from './connectionReducer'
import { trafficReducer } from './trafficReducer'

export default combineReducers({
  connectionReducer,
  trafficReducer,
})
