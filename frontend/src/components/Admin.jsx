import React, { useState } from 'react'
import { Container, Button, Spinner } from 'react-bootstrap'
import { useToasts } from 'react-toast-notifications'
import { ethers, BigNumber } from 'ethers'

export function AdminPanel(props) {
  const { addToast } = useToasts()

  const [isRestock, setIsRestock] = useState(false)

  async function restockItems() {
    const contract = props.contract

    setIsRestock(true)
    addToast('Items Being Restocked', { appearance: 'info' })
    await contract.reStock()
  }
  async function withdrawMoney() {
    const contract = props.contract

    setIsRestock(false)
    addToast('Cashing Out', { appearance: 'info' })
    await contract.withdraw()
  }

  async function getBalance() {
    const contract = props.contract
    const rawContractBalance = await contract.getBalance()
    const balance = ethers.utils.formatEther(rawContractBalance)
    addToast('Current Contract Balance: ' + balance, { appearance: 'success' })
  }

  return (
    <Container
      style={{
        height: 230,
        width: 680,
        marginTop: '50px',
        backgroundColor: 'black',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '5px',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '15px',
      }}
    >
      <h2 style={{ color: 'white' }}>Admin Panel</h2>
      <Container
        style={{
          height: 150,
          width: 620,
          backgroundColor: 'white',
          justifyContent: 'space-evenly',
          alignItems: 'center',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '15px',
        }}
      >
        <Button variant="success" onClick={restockItems}>
          Restock Items
        </Button>
        <Button variant="danger" onClick={withdrawMoney}>
          Withdraw Funds
        </Button>
        <Button variant="primary" onClick={async () => await getBalance()}>
          Get Contract Balance
        </Button>
      </Container>
    </Container>
  )
}
