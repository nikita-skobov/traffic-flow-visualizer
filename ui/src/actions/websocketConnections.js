/* global WebSocket */

import {
  WS_CONNECTION_BEGIN,
  WS_CONNECTION_ESTABLISHED,
  WS_CONNECTION_FAILED,
  WS_CONNECTION_CLOSED,
  WS_MESSAGE,
} from '../constants'

export function wsBegin(url) {
  return {
    type: WS_CONNECTION_BEGIN,
    payload: {
      url,
    },
  }
}

export function wsClose(url) {
  return {
    type: WS_CONNECTION_CLOSED,
    payload: {
      url,
    },
  }
}

export function wsMessage(url, msg) {
  return {
    type: WS_MESSAGE,
    payload: {
      url,
      msg,
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
  const wsUrl = url
  return (dispatch) => {
    dispatch(wsBegin(wsUrl))
    const ws = new WebSocket(wsUrl)
    ws.binaryType = 'arraybuffer'


    ws.onerror = (err) => {
      dispatch(wsFail(wsUrl, err))
    }

    ws.onopen = () => {
      dispatch(wsSuccess(wsUrl, ws))
    }

    ws.onclose = () => {
      dispatch(wsClose(wsUrl))
    }

    ws.onmessage = (msg) => {
      dispatch(wsMessage(wsUrl, msg.data))
    }
  }
}
