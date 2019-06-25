import {
  WS_MESSAGE,
} from '../constants'

import { has } from '../utilities'
import {
  isTransmitted,
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
      const packetIsTransmitted = isTransmitted(uintarr)

      if (!has.call(retObj, externalIP)) {
        retObj[externalIP] = {
          lastTime: new Date().getTime(),
          tx: {
            total: packetIsTransmitted ? bytesInPacket : 0,
          },
          rx: {
            total: packetIsTransmitted ? 0 : bytesInPacket,
          },
        }
      } else if (packetIsTransmitted) {
        retObj[externalIP].lastTime = new Date().getTime()
        retObj[externalIP].tx.total += bytesInPacket
      } else {
        retObj[externalIP].lastTime = new Date().getTime()
        retObj[externalIP].rx.total += bytesInPacket
      }

      return retObj
    }

    default:
      return state
  }
}
