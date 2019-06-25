import React from 'react'

export default function SVGBar(props) {
  const {
    width = '100%',
    height = '10',
    xOffset = '0',
    yOffset = '0',
    barWidth,
  } = props

  return (
    <svg width={width} height={height}>
      <rect
        x={xOffset}
        y={yOffset}
        width={barWidth}
        height="100%"
        style={{ fill: 'red', opacity: '0.5' }}
      />
    </svg>
  )
}
