/* global expect it describe jest fetch afterEach beforeEach */
import * as reduxFuncs from 'redux'
import thunk from 'redux-thunk'
import reducers, { defaultState } from './reducers/index'

import * as setup from './setupStore'

describe('setup store function', () => {
  const { createStore, applyMiddleware } = reduxFuncs

  it('should use thunk as middleware, and ./reducers as the reducers by default', () => {
    const defaultStore = setup.setupStore()
    const specificStore = createStore(reducers, {}, applyMiddleware(thunk))

    const defaultPropStrings = []
    const specificPropStrings = []
    Object.keys(defaultStore).forEach((key) => {
      defaultPropStrings.push(defaultStore[key].toString())
    })
    Object.keys(specificStore).forEach((key) => {
      specificPropStrings.push(specificStore[key].toString())
    })
    // all the functions/properties of the 2 ways to create a store
    // are the same when stringified
    expect(defaultPropStrings).toEqual(specificPropStrings)
  })

  it('should allow the user to override the middleware by passing in the first argument', () => {
    const customMiddlewareFunc = () => next => action => next(action)
    const myMiddleware = applyMiddleware(customMiddlewareFunc)
    const overrideStore = setup.setupStore(myMiddleware)
    const specificStore = createStore(reducers, {}, myMiddleware)

    const defaultPropStrings = []
    const specificPropStrings = []
    Object.keys(overrideStore).forEach((key) => {
      defaultPropStrings.push(overrideStore[key].toString())
    })
    Object.keys(specificStore).forEach((key) => {
      specificPropStrings.push(specificStore[key].toString())
    })
    // all the functions/properties of the 2 ways to create a store
    // are the same when stringified
    expect(defaultPropStrings).toEqual(specificPropStrings)
  })

  it('should allow the user to override the initial state by passing in the second argument', () => {
    const overrideStore = setup.setupStore(undefined, { repo: 'state' })
    const specificStore = createStore(reducers, { repo: 'state' }, applyMiddleware(thunk))
    expect(overrideStore.getState()).toEqual(defaultState)
    expect(specificStore.getState()).toEqual(defaultState)
  })

  it('should allow the user to override the reducers by passing in the third argument', () => {
    const myCustomReducer = (state = {}, action) => {
      switch (action) {
        default:
          return state
      }
    }

    const overrideStore = setup.setupStore(undefined, undefined, myCustomReducer)
    const specificStore = createStore(myCustomReducer, {}, applyMiddleware(thunk))

    const defaultPropStrings = []
    const specificPropStrings = []
    Object.keys(overrideStore).forEach((key) => {
      defaultPropStrings.push(overrideStore[key].toString())
    })
    Object.keys(specificStore).forEach((key) => {
      specificPropStrings.push(specificStore[key].toString())
    })
    // all the functions/properties of the 2 ways to create a store
    // are the same when stringified
    expect(defaultPropStrings).toEqual(specificPropStrings)
  })
})

describe('create enhancers function', () => {
  it('should use the redux compose function if no dev tools are present', () => {
    reduxFuncs.compose = jest.fn(reduxFuncs.compose)
    setup.createEnhancers([thunk])
    expect(reduxFuncs.compose).toHaveBeenCalledTimes(1)
  })

  it('should use the window devtools compose function if present', () => {
    // eslint-disable-next-line
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ = jest.fn(reduxFuncs.compose)
    setup.createEnhancers([thunk])
    // eslint-disable-next-line
    expect(window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__).toHaveBeenCalledTimes(1)
  })

  it('should work if you pass multiple middleware functions', () => {
    reduxFuncs.applyMiddleware = jest.fn(reduxFuncs.applyMiddleware)
    const middleWare1 = () => next => action => next(action)
    const middleWare2 = () => next => action => next(action)
    setup.createEnhancers([middleWare1, middleWare2])
    expect(reduxFuncs.applyMiddleware).toHaveBeenCalledWith(middleWare1, middleWare2)
  })
})
