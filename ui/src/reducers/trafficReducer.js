import {
  WS_MESSAGE,
} from '../constants'

import { has } from '../utilities'
import {
  isReceived,
  getLength,
  getExternalIP,
} from '../utilities/wsMessage'


export const defaultTrafficState = {}
export function trafficReducer(state = defaultTrafficState, action) {
  switch (action.type) {
    case WS_MESSAGE: {
      const retObj = { ...state }
      const { msg } = action.payload
      const uintarr = new Uint8Array(msg)

      const externalIP = getExternalIP(uintarr)
      const bytesInPacket = getLength(uintarr)
      const isTransmitted = !isReceived(uintarr)

      if (!has.call(retObj, externalIP)) {
        retObj[externalIP] = {
          tx: {
            total: isTransmitted ? bytesInPacket : 0,
          },
          rx: {
            total: isTransmitted ? 0 : bytesInPacket,
          },
        }
      } else if (isTransmitted) {
        retObj[externalIP].tx.total += bytesInPacket
      } else {
        retObj[externalIP].rx.total += bytesInPacket
      }

      return retObj
    }

    default:
      return state
  }
}
