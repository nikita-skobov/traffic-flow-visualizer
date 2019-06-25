import React, { Component } from 'react'
import { connect } from 'react-redux'

import {
  ListGroup,
  ListGroupItem,
  Table,
} from 'reactstrap'

import SVGBar from './SVGBar'

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
        <SVGBar width="200%" xOffset={rxOffset} barWidth={rxPercent} />
      </td>
      <td className="tdp-l border-left" />
      <td className="tdp-c blt brt" key={ip}>{ip}</td>
      <td className="tdp-r border-right bar-pad">
        <SVGBar width="200%" xOffset="0" barWidth={txPercent} />
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
