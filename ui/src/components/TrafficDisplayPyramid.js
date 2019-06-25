import React, { Component } from 'react'
import { connect } from 'react-redux'

import {
  ListGroup,
  ListGroupItem,
  Table,
} from 'reactstrap'


import TDPBar from './TDPBar'
import TDPAxis from './TDPAxis'

function TrafficDisplay(props) {
  const {
    ips,
    maxRx,
    maxTx,
  } = props


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
            <th className="tdp-l" />
            <th className="tdp-c">IP</th>
            <th className="tdp-r" />
            <th className="tdp-r">Transmitted</th>
          </tr>
        </thead>
        <tbody>
          {ipList}
        </tbody>
        <tfoot>
          <TDPAxis maxRx={maxRx} maxTx={maxTx} />
        </tfoot>
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

  let maxTx = 0
  let maxRx = 0

  ips.sort((a, b) => {
    const ipObjA = state.trafficReducer[a]
    const ipObjB = state.trafficReducer[b]

    if (ipObjA.tx.total > maxTx) maxTx = ipObjA.tx.total
    if (ipObjB.tx.total > maxTx) maxTx = ipObjB.tx.total

    if (ipObjA.rx.total > maxRx) maxRx = ipObjA.rx.total
    if (ipObjB.rx.total > maxRx) maxRx = ipObjB.rx.total

    const ipATotal = ipObjA.tx.total + ipObjA.rx.total
    const ipBTotal = ipObjB.tx.total + ipObjB.rx.total
    return (ipBTotal - ipATotal)
  })


  return {
    ips,
    maxTx,
    maxRx,
  }
}

export default connect(mapStateToProps)(TrafficDisplay)
