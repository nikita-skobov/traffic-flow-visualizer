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
  const now = new Date().getTime()
  const someInterval = 10000 // 10s
  // const ips = Object.keys(state.trafficReducer)
  const ips = Object.keys(state.trafficReducer)
    .filter(ip => state.trafficReducer[ip].lastTime >= now - someInterval)

  return {
    ips,
  }
}

export default connect(mapStateToProps)(TrafficDisplay)
