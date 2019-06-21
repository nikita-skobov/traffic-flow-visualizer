/* global WebSocket */

import {
  WS_CONNECTION_BEGIN,
  WS_CONNECTION_ESTABLISHED,
  WS_CONNECTION_FAILED,
} from '../constants'

export function wsBegin(url) {
  return {
    type: WS_CONNECTION_BEGIN,
    payload: {
      url,
    },
  }
}

export function wsFail(url, err) {
  return {
    type: WS_CONNECTION_FAILED,
    payload: {
      url,
      err,
    },
  }
}

export function wsSuccess(url, ws) {
  return {
    type: WS_CONNECTION_ESTABLISHED,
    payload: {
      url,
      ws,
    },
  }
}

export function connectTo(url) {
  console.log(`url: ${url}`)
  const wsUrl = url
  return (dispatch) => {
    dispatch(wsBegin(wsUrl))
    const ws = new WebSocket(wsUrl)
    console.log(ws)


    ws.onerror = (err) => {
      dispatch(wsFail(wsUrl, err))
    }

    ws.onopen = () => {
      dispatch(wsSuccess(wsUrl, ws))
    }
  }
}
