import React, { Component } from 'react'
import { connect } from 'react-redux'

import {
  Button,
  Input,
  InputGroup,
  InputGroupAddon,
} from 'reactstrap'

import { connectTo } from '../actions/websocketConnections'

export class Connector extends Component {
  constructor(props) {
    super(props)

    this.connectionBegin = this.connectionBegin.bind(this)
  }

  connectionBegin(ev) {
    ev.preventDefault()
    const [input] = ev.target.getElementsByTagName('input')
    const { value } = input

    const { ws, wsConnect } = this.props
    const url = value || ws
    wsConnect(url)
  }

  render() {
    const { ws } = this.props

    return (
      <form action="#" onSubmit={this.connectionBegin}>
        <InputGroup>
          <Input placeholder={ws} />
          <InputGroupAddon addonType="append">
            <Button>Connect</Button>
          </InputGroupAddon>
        </InputGroup>
      </form>
    )
  }
}

const mapActionsToProps = {
  wsConnect: connectTo,
}

export default connect(undefined, mapActionsToProps)(Connector)
