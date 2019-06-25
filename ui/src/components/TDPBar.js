import React, { Component } from 'react'
import { connect } from 'react-redux'

import {
  ListGroup,
  ListGroupItem,
  Table,
} from 'reactstrap'

export function Bar(props) {
  const { tx, rx, ip, maxRx, maxTx } = props

  const maxRxNot0 = maxRx || 1
  const maxTxNot0 = maxTx || 1
  let rxPercent = Math.ceil(rx / maxRxNot0 * 100)
  let txPercent = Math.ceil(tx / maxTxNot0 * 100)
  const rxOffset = `${100 - rxPercent}%`
  txPercent = `${txPercent}%`
  rxPercent = `${rxPercent}%`

  return (
    <tr>
      <td className="tdp-l bar-pad">
        <svg width="200%" height="5">
          <rect
            x={rxOffset}
            y="0"
            width={rxPercent}
            height="100%"
            style={{ fill: 'red', opacity: '0.5' }}
          />
        </svg>
      </td>
      <td className="tdp-l border-left" />
      <td className="tdp-c blt brt" key={ip}>{ip}</td>
      <td className="tdp-r border-right bar-pad">
        <svg width="200%" height="5">
          <rect
            x="0"
            y="0"
            width={txPercent}
            height="100%"
            style={{ fill: 'red', opacity: '0.5' }}
          />
        </svg>
      </td>
      <td className="tdp-r" />
    </tr>
  )
}


const mapStateToProps = (state, ownProps) => {
  const { ip } = ownProps
  const barState = {
    tx: state.trafficReducer[ip].tx.total,
    rx: state.trafficReducer[ip].rx.total,
    ip,
  }
  return barState
}
export default connect(mapStateToProps)(Bar)
