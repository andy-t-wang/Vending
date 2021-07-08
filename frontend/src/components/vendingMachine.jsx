import React, { useState } from 'react'
import { VendingItem } from './vendingItem'
import { Container, Button, Spinner } from 'react-bootstrap'
import { useToasts } from 'react-toast-notifications'
import { ethers, BigNumber } from 'ethers'
import { ShakeRotate } from 'reshake'

export function VendingMachine(props) {
  const { addToast } = useToasts()

  const [selectedItem, setSelectedItem] = useState(0)
  const [isBuy, setIsBuy] = useState(false)

  function handleClick(i) {
    setSelectedItem(i)
  }
  async function buyItem() {
    const contract = props.contract
    const count = await contract.getItemCount(selectedItem)
    const itemCount = BigNumber.from(count).toNumber()
    if (props.itemsCount[selectedItem] == 0 || itemCount == 0) {
      addToast('Sorry. Out of Stock', { appearance: 'error' })
    } else {
      setIsBuy(true)
      addToast('Request Recieved', { appearance: 'info' })
      props.loadingCallBack(true)
      await contract.buy(selectedItem)
    }
  }
  async function shakeMachine() {
    setIsBuy(false)
    addToast('Shaking Machine', { appearance: 'info' })
    const contract = props.contract
    props.loadingCallBack(true)
    await contract.shake({ value: ethers.utils.parseEther(props.shakeFee) })
  }

  return (
    <ShakeRotate
      h={5}
      v={5}
      r={3}
      dur={1000}
      int={10}
      q={'infinite'}
      active={props.loading && !isBuy}
      max={90}
      fixed={false}
      fixedStop={false}
      freez={false}
    >
      <Container
        style={{
          height: 750,
          width: 680,
          backgroundColor: '#F40009',
          justifyContent: 'center',
          alignItems: 'center',
          display: 'flex',
          borderRadius: '15px',
        }}
      >
        <Container
          style={{
            height: 700,
            width: 650,
            backgroundColor: '#1E1E1E',
            borderRadius: '20px',
            padding: '10px',
            justifyContent: 'space-evenly',
            alignItems: 'center',
          }}
        >
          {props.items.map((item, i) => {
            return (
              <a onClick={() => handleClick(i)} key={i}>
                <VendingItem item={item} count={props.itemsCount[i]} />
              </a>
            )
          })}
        </Container>
        <div
          style={{
            padding: '10px',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <h2 style={{ color: 'white' }}>NFT Machine</h2>
          <div
            style={{
              backgroundColor: 'black',
              width: '140px',
              height: '40px',
              display: 'flex',
              borderRadius: '5px',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <p
              style={{
                color: '#00FF00',
                fontWeight: 'bold',
                fontSize: '20px',
                padding: '0px',
                margin: '0px',
              }}
            >
              {'A' + selectedItem}
            </p>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              height: 200,
              justifyContent: 'space-evenly',
            }}
          >
            <Button
              size="lg"
              variant="success"
              onClick={buyItem}
              disabled={props.loading}
            >
              {props.loading && isBuy && <Spinner animation="grow" />}
              {(!props.loading || !isBuy) && 'Buy'}
            </Button>
            <Button
              size="lg"
              variant="dark"
              onClick={shakeMachine}
              disabled={!props.canShake}
            >
              {props.loading && !isBuy && <Spinner animation="grow" />}
              {(!props.loading || isBuy) && 'Shake'}
            </Button>
            <p style={{ color: 'white' }}>
              Current Shake Fee - {props.shakeFee} ether
            </p>
          </div>
        </div>
      </Container>
    </ShakeRotate>
  )
}
