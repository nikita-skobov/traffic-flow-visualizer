import React from 'react'
import { connect } from 'react-redux'

import {
  Button,
  Input,
  InputGroup,
  InputGroupAddon,
} from 'reactstrap'

export function Connector(props) {
  const { ws } = props

  return (
    <div>
      <InputGroup>
        <Input placeholder={ws} />
        <InputGroupAddon addonType="append">
          <Button>Connect</Button>
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}

export default connect()(Connector)
