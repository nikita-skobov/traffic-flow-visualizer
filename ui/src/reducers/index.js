import { combineReducers } from 'redux'

function sampleReducer(state = {}, action) {
  switch (action.type) {
    default:
      return state
  }
}


export default combineReducers({
  sampleReducer,
})
