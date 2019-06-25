import React, { Component } from 'react'
import { connect } from 'react-redux'

import {
  ListGroup,
  ListGroupItem,
  Table,
} from 'reactstrap'


import TDPBar from './TDPBar'

function TrafficDisplay(props) {
  const { ips } = props

  const ipList = []
  ips.forEach((ip) => {
    ipList.push(
      <TDPBar ip={ip} />,
    )
  })

  return (
    <div>
      <Table size="sm">
        <thead>
          <tr>
            <th className="tdp-l">Received</th>
            <th className="tdp-c">IP</th>
            <th className="tdp-r">Transmitted</th>
          </tr>
        </thead>
        <tbody>
          {ipList}
        </tbody>
      </Table>
    </div>
  )
}


const mapStateToProps = (state) => {
  const ips = Object.keys(state.trafficReducer)
  return {
    ips,
  }
}

export default connect(mapStateToProps)(TrafficDisplay)
