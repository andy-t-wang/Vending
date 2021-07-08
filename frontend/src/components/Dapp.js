import React from 'react'

// We'll use ethers to interact with the Ethereum network and our contract
import { ethers, BigNumber } from 'ethers'

// We import the contract's artifacts and address here, as we are going to be
// using them with ethers
import TokenArtifact from '../contracts/Vending.json'
import contractAddress from '../contracts/contract-address.json'

// All the logic of this dapp is contained in the Dapp component.
// These other components are just presentational ones: they don't have any
// logic. They just render HTML.
import { NoWalletDetected } from './NoWalletDetected'
import { ConnectWallet } from './ConnectWallet'

import { Loading } from './Loading'
import { VendingMachine } from './vendingMachine'
import { AdminPanel } from './Admin'

import { TransactionErrorMessage } from './TransactionErrorMessage'

// This is the Hardhat Network id, you might change it in the hardhat.config.js
// Here's a list of network ids https://docs.metamask.io/guide/ethereum-provider.html#properties
// to use when deploying to other networks.
const HARDHAT_NETWORK_ID = '31337'

// This is an error code that indicates that the user canceled a transaction
const ERROR_CODE_TX_REJECTED_BY_USER = 4001

// This component is in charge of doing these things:
//   1. It connects to the user's wallet
//   2. Initializes ethers and the Token contract
//   3. Polls the user balance to keep it updated.
//   4. Transfers tokens by sending transactions
//   5. Renders the whole application
//
// Note that (3) and (4) are specific of this sample application, but they show
// you how to keep your Dapp and contract's state in sync,  and how to send a
// transaction.
export class Dapp extends React.Component {
  constructor(props) {
    super(props)

    // We store multiple things in Dapp's state.
    // You don't need to follow this pattern, but it's an useful example.
    this.initialState = {
      // The info of the token (i.e. It's Name and symbol)
      itemsData: [],
      stuckItems: [],
      itemsCount: [],
      // The user's address and balance
      selectedAddress: undefined,
      balance: undefined,
      shakeFee: 9999,
      canShake: false,
      loading: false,
      // The ID about transactions being sent, and any possible error with them
      txBeingSent: undefined,
      transactionError: undefined,
      networkError: undefined,
    }

    this.state = this.initialState
  }

  render() {
    // Ethereum wallets inject the window.ethereum object. If it hasn't been
    // injected, we instruct the user to install MetaMask.
    if (window.ethereum === undefined) {
      return <NoWalletDetected />
    }
    const updateLoading = (update) => {
      this.setState({ loading: update })
    }
    if (!this.state.selectedAddress) {
      return (
        <ConnectWallet
          connectWallet={() => this._connectWallet()}
          networkError={this.state.networkError}
          dismiss={() => this._dismissNetworkError()}
        />
      )
    }

    // If the items in the vending maching
    if (!this.state.itemsData && !this.state.stuckItems) {
      return <Loading />
    }

    // If everything is loaded, we render the application.
    return (
      <div className="container p-4">
        <div className="row">
          <div className="col-12">
            <h2>Welcome to the Wonky Vending Machine.</h2>
            <p>Your Address: {this.state.selectedAddress}</p>
            <p>
              Your Balance: <b>{this.state.balance} Ether</b> <br />
              Your VEND: {this.state.vendBalance} VEND
              <br></br>
              Supply: {this.state.totalSupply} VEND
              <br></br>
              Contract Balance: {this.state.contractBalance} VEND
            </p>
          </div>
        </div>
        <hr />
        <div className="col-12">
          <div className="row">
            <VendingMachine
              shakeFee={this.state.shakeFee}
              items={this.state.itemsData}
              itemsCount={this.state.itemsCount}
              canShake={this.state.canShake}
              contract={this._token}
              loadingCallBack={updateLoading}
              loading={this.state.loading}
            />
            <AdminPanel
              stuckItems={this.state.stuckItems}
              contract={this._token}
            />
            {this.state.transactionError && (
              <TransactionErrorMessage
                message={this._getRpcErrorMessage(this.state.transactionError)}
                dismiss={() => this._dismissTransactionError()}
              />
            )}
          </div>
        </div>
      </div>
    )
  }

  async _connectWallet() {
    const [selectedAddress] = await window.ethereum.enable()

    if (!this._checkNetwork()) {
      return
    }

    this._initialize(selectedAddress)

    // We reinitialize it whenever the user changes their account.
    window.ethereum.on('accountsChanged', ([newAddress]) => {
      this._stopPollingData()

      if (newAddress === undefined) {
        return this._resetState()
      }

      this._initialize(newAddress)
    })

    // We reset the dapp state if the network is changed
    window.ethereum.on('networkChanged', ([networkId]) => {
      this._stopPollingData()
      this._resetState()
    })
  }

  _initialize(userAddress) {
    this.setState({
      selectedAddress: userAddress,
    })

    this._intializeEthers()
    this._getItemsData()
  }

  async _intializeEthers() {
    // We first initialize ethers by creating a provider using window.ethereum
    this._provider = new ethers.providers.Web3Provider(window.ethereum)

    this._token = new ethers.Contract(
      contractAddress.Vending,
      TokenArtifact.abi,
      this._provider.getSigner(0),
    )
    const { addToast } = this.props

    this._token.on('itemBought', (name, imageUrl, description, event) => {
      this.setState({ loading: false })
      addToast('Successful Purchase', { appearance: 'success' })
      this._getItemsData()
    })

    this._token.on('itemStuck', (name, imageUrl, description, event) => {
      addToast('Item Got Stuck. You can try to shake it free', {
        appearance: 'error',
      })
      this._getItemsData()
      this.setState({ canShake: true, loading: false })
    })

    this._token.on('itemFreed', (name, imageUrl, description, event) => {
      addToast('Item Freed. You got ' + name + ' Congrats!', {
        appearance: 'success',
      })
      this._getItemsData()
      this.setState({ loading: false })
    })

    this._token.on('failed', (name, imageUrl, description, event) => {
      addToast('Shake Failed', {
        appearance: 'error',
      })
      this._getItemsData()
      this.setState({ loading: false })
    })
    this._token.on('withdrawEmit', (rawBalance) => {
      const balance = ethers.utils.formatEther(rawBalance)
      addToast('Withdraw Successful amount:' + balance, {
        appearance: 'success',
      })
      this._getItemsData()
    })
    this._token.on('restockSuccess', () => {
      addToast('Restock Successful', {
        appearance: 'success',
      })
      this._getItemsData()
    })
  }

  // The next two methods just read from the contract and store the results
  // in the component state.
  async _getItemsData() {
    const itemsData = await this._token.getAllItems()
    const stuckItemsData = await this._token.getStuckItems()
    const shakeFee = await this._token.shakeFee()
    let countArr = []
    let balance = await this._provider.getBalance(this.state.selectedAddress)
    let vendBalance = await this._token.balanceOf(this.state.selectedAddress)
    let totalSupply = await this._token.totalSupply()
    let contractVend = await this._token.balanceOf(this._token.address)
    for (const [i, value] of itemsData.entries()) {
      let count = await this._token.getItemCount(i)
      countArr.push(BigNumber.from(count).toNumber())
    }

    this.setState({
      itemsData: [...itemsData],
      stuckItems: [...stuckItemsData],
      canShake: stuckItemsData.length > 0,
      balance: ethers.utils.formatEther(balance),
      vendBalance: BigNumber.from(vendBalance).toNumber(),
      totalSupply: BigNumber.from(totalSupply).toNumber(),
      contractBalance: BigNumber.from(contractVend).toNumber(),
      shakeFee: ethers.utils.formatEther(shakeFee),
      itemsCount: countArr,
    })
  }

  // This method just clears part of the state.
  _dismissTransactionError() {
    this.setState({ transactionError: undefined })
  }

  // This method just clears part of the state.
  _dismissNetworkError() {
    this.setState({ networkError: undefined })
  }

  // This is an utility method that turns an RPC error into a human readable
  // message.
  _getRpcErrorMessage(error) {
    if (error.data) {
      return error.data.message
    }

    return error.message
  }

  // This method resets the state
  _resetState() {
    this.setState(this.initialState)
  }

  // This method checks if Metamask selected network is Localhost:8545
  _checkNetwork() {
    if (window.ethereum.networkVersion === HARDHAT_NETWORK_ID) {
      return true
    }

    this.setState({
      networkError: 'Please connect Metamask to Localhost:8545',
    })

    return false
  }
}
