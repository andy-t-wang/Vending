import React from 'react'
import { Toast } from 'react-bootstrap'

export function Toasty(props) {
  return (
    <Toast
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
      }}
      delay={3000}
      show={props.show}
    >
      <Toast.Header>
        <strong className="mr-auto">{props.title}</strong>
        <small>Just now</small>
      </Toast.Header>
      <Toast.Body>{props.description}</Toast.Body>
    </Toast>
  )
}
