import { OverlayTrigger, Popover, Image } from 'react-bootstrap'
import React from 'react'
import spring from '../spring.png'
function popover(props, count) {
  return (
    <Popover id="popover-basic">
      <Popover.Title as="h3">{props.name}</Popover.Title>
      <Popover.Content>
        {props.description} <br /> Stock: {count} <br />{' '}
        <b>Price: {props.vendCost} VEND</b>
      </Popover.Content>
    </Popover>
  )
}

export function VendingItem(props) {
  return (
    <OverlayTrigger
      trigger={['hover', 'focus']}
      placement="bottom"
      overlay={popover(props.item, props.count)}
    >
      <Image
        style={{
          height: 200,
          width: 150,
          borderRadius: '20px',
          margin: '15px',
        }}
        src={props.item.imageUrl}
        alt="image"
      />
    </OverlayTrigger>
  )
}
