import React, { Component } from 'react'
import { connect } from 'react-redux'

import {
  ListGroup,
  ListGroupItem,
  Table,
} from 'reactstrap'

export function Bar(props) {
  const { tx, rx, ip } = props

  return (
    <tr>
      <td className="tdp-l">{tx}</td>
      <td className="tdp-c" key={ip}>{ip}</td>
      <td className="tdp-r">{rx}</td>
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
