import React, { Component } from 'react'
import { connect } from 'react-redux'

import { useCountUp } from 'react-countup'
import {
  ListGroup,
  ListGroupItem,
  Table,
} from 'reactstrap'

export class Axis extends Component {
  constructor(props) {
    super(props)

    this.updateMaxRx = () => {}
    this.updateHalfRx = () => {}
    this.updateMaxTx = () => {}
    this.updateHalfTx = () => {}

    this.RxMax = () => {
      const { countUp, update } = useCountUp({
        start: 0,
        end: 100,
        duration: 5,
      })

      this.updateMaxRx = update

      return <span>{countUp}</span>
    }
    this.RxHalfMax = () => {
      const { countUp, update } = useCountUp({
        start: 0,
        end: 50,
        duration: 5,
      })

      this.updateHalfRx = update

      return <span>{countUp}</span>
    }
    this.TxMax = () => {
      const { countUp, update } = useCountUp({
        start: 0,
        end: 100,
        duration: 5,
      })

      this.updateMaxTx = update

      return <span>{countUp}</span>
    }
    this.TxHalfMax = () => {
      const { countUp, update } = useCountUp({
        start: 0,
        end: 50,
        duration: 5,
      })

      this.updateHalfTx = update

      return <span>{countUp}</span>
    }
  }

  shouldComponentUpdate(nextProps) {
    if (this.maxRx !== nextProps.maxRx) {
      this.updateMaxRx(nextProps.maxRx)
      this.updateHalfRx(nextProps.maxRx / 2)
    }
    if (this.maxTx !== nextProps.maxTx) {
      this.updateMaxTx(nextProps.maxTx)
      this.updateHalfTx(nextProps.maxTx / 2)
    }

    return false
  }

  render() {
    const { RxMax, TxMax } = this

    return (
      <tr>
        <td><RxMax /></td>
        <td />
        <td><TxMax /></td>
      </tr>
    )
  }
}

export default connect()(Axis)
