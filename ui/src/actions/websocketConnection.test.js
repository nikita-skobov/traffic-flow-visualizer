/* global expect describe it beforeEach global */
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { waitMilliseconds } from '../utilities'
import * as wsActions from './websocketConnections'
import {
  WS_CONNECTION_BEGIN,
  WS_CONNECTION_ESTABLISHED,
  WS_CONNECTION_FAILED,
  WS_CONNECTION_CLOSED,
  WS_MESSAGE,
} from '../constants'

describe('websocketConnection module', () => {
  describe('wsBegin action', () => {
    it(`it should disaptch ${WS_CONNECTION_BEGIN} and return a payload with a url`, () => {
      const url = 'url'
      expect(wsActions.wsBegin(url)).toEqual(expect.objectContaining({
        type: WS_CONNECTION_BEGIN,
        payload: expect.objectContaining({
          url,
        }),
      }))
    })
  })

  describe('wsSuccess action', () => {
    it(`it should disaptch ${WS_CONNECTION_ESTABLISHED} and return a payload with a url and ws object`, () => {
      const url = 'url'
      const wsObject = { some: 'object' }
      expect(wsActions.wsSuccess(url, wsObject)).toEqual(expect.objectContaining({
        type: WS_CONNECTION_ESTABLISHED,
        payload: expect.objectContaining({
          url,
          ws: wsObject,
        }),
      }))
    })
  })

  describe('wsFail action', () => {
    it(`it should disaptch ${WS_CONNECTION_FAILED} and return a payload with a url and an error`, () => {
      const url = 'url'
      const errObject = { some: 'error' }
      expect(wsActions.wsFail(url, errObject)).toEqual(expect.objectContaining({
        type: WS_CONNECTION_FAILED,
        payload: expect.objectContaining({
          url,
          err: errObject,
        }),
      }))
    })
  })

  describe('wsClose action', () => {
    it(`it should disaptch ${WS_CONNECTION_CLOSED} and return a payload with a url`, () => {
      const url = 'url'
      expect(wsActions.wsClose(url)).toEqual(expect.objectContaining({
        type: WS_CONNECTION_CLOSED,
        payload: expect.objectContaining({
          url,
        }),
      }))
    })
  })

  describe('wsMessage action', () => {
    it(`it should disaptch ${WS_MESSAGE} and return a payload with a url and a message`, () => {
      const url = 'url'
      const someMsg = [100]
      expect(wsActions.wsMessage(url, someMsg)).toEqual(expect.objectContaining({
        type: WS_MESSAGE,
        payload: expect.objectContaining({
          url,
          msg: someMsg,
        }),
      }))
    })
  })


  describe('connectTo action', () => {
    let store

    beforeEach(() => {
      const middlewares = [thunk]
      const mockStore = configureMockStore(middlewares)
      store = mockStore({})
    })

    it(`should dispatch ${WS_CONNECTION_BEGIN}, and ${WS_CONNECTION_ESTABLISHED} if successful`, async () => {
      global.WebSocket = function ws(url) {
        this.url = url
        this.onerror = () => {}
        this.onopen = () => {}
        setTimeout(() => { this.onopen() }, 1)
      }

      wsActions.connectTo('somewsurl')(store.dispatch)
      await waitMilliseconds(2)
      expect(store.getActions()).toEqual([
        expect.objectContaining({ type: WS_CONNECTION_BEGIN }),
        expect.objectContaining({ type: WS_CONNECTION_ESTABLISHED }),
      ])
    })

    it(`should dispatch ${WS_CONNECTION_BEGIN}, and ${WS_CONNECTION_FAILED} if it fails`, async () => {
      global.WebSocket = function ws(url) {
        this.url = url
        this.onerror = () => {}
        this.onopen = () => {}
        setTimeout(() => { this.onerror() }, 1)
      }

      wsActions.connectTo('somewsurl')(store.dispatch)
      await waitMilliseconds(2)
      expect(store.getActions()).toEqual([
        expect.objectContaining({ type: WS_CONNECTION_BEGIN }),
        expect.objectContaining({ type: WS_CONNECTION_FAILED }),
      ])
    })
  })
})
