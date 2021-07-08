const { expect } = require('chai')
const { ethers } = require('hardhat')

const initalFunds = 100
describe('Vending ', function () {
  let Vending
  let vending
  let owner
  let addrs1
  let addrs2
  let addrs
  let shakeFee = '0.0021'
  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    ;[owner, addrs1, addrs1, ...addrs] = await ethers.getSigners()
    owner = addrs[0]
    Vending = await ethers.getContractFactory('VendingHelper')
    vending = await Vending.deploy(initalFunds)
  })

  describe('Init', function () {
    it('Should have the right number of items in the machine', async function () {
      const length = await vending.getLength()
      expect(length).to.equal(3)
    })
    it('Check Items', async function () {
      const data = await vending.items(0)
      expect(data.name).to.equal('Coke Poster')
    })
    it('Check Total Array', async function () {
      const data = await vending.getAllItems()
      expect(data.length).to.equal(3)
    })
  })
  describe('Util test', function () {
    it('Buy Something', async function () {
      const initialStock = await vending.getItemCount(1)
      await vending.buy(1)
      const afterStock = await vending.getItemCount(1)
      expect(initialStock.toNumber()).to.equal(afterStock.toNumber() + 1)
    })

    it('Shake', async function () {
      await vending.buy(1)
      let stuckItems = await vending.getStuckItemCount()
      while (stuckItems < 2) {
        await vending.buy(1)
        stuckItems = await vending.getStuckItemCount()
      }
      const stuckItem = await vending.stuckItems(0)
      const boughtItem = await vending.items(1)
      expect(stuckItem.name).to.equal(boughtItem.name)
      await vending.shake({
        value: ethers.utils.parseEther(shakeFee),
      })
    })

    xit('Withdraw', async function () {
      const result = await vending.shake({
        value: ethers.utils.parseEther(shakeFee),
      })
      const balance = await vending.getBalance()
      expect(ethers.utils.formatEther(balance)).to.equal(shakeFee)
      await vending.withdraw()
      const newBalance = await vending.getBalance()
      expect(newBalance).to.equal(0)
    })
  })
  describe('Transaction', function () {
    it('Get name and symbol', async function () {
      var name = await vending.name()
      var symbol = await vending.symbol()
      expect(name).to.equal('Vending')
      expect(symbol).to.equal('VEND')
    })
    it('Test Transfer to account', async function () {
      var transfer = await vending.transfer(owner.address, 10)
      console.log(transfer)
      const balance = await vending.balanceOf(owner.address)
      expect(balance).to.equal(10)
    })
    it('Initial Supply', async function () {
      var supply = await vending.totalSupply()
      expect(supply).to.equal(initalFunds)
    })
    it('Test Transfer between accounts', async function () {
      await vending.transfer(owner.address, 10)
      await vending
        .connect(owner)
        .transfer(addrs1.address, 5, { from: owner.address })
      const ownerBalance = await vending.balanceOf(owner.address)
      const addr1Balance = await vending.balanceOf(addrs1.address)

      expect(ownerBalance).to.equal(addr1Balance).to.equal(5)
    })
    it('Test Transfer between accounts', async function () {
      await vending.transfer(owner.address, 10)
      await vending.connect(owner).transfer(addrs1.address, 5)
      const ownerBalance = await vending.balanceOf(owner.address)
      const addr1Balance = await vending.balanceOf(addrs1.address)

      expect(ownerBalance).to.equal(addr1Balance).to.equal(5)
    })
    it('Test Approval between accounts', async function () {
      await vending.transfer(owner.address, 10)
      await vending.connect(owner).approve(addrs1.address, 5)
      expect(await vending.balanceOf(addrs1.address)).to.equal(0)
      vending.connect(addrs1).transferFrom(owner.address, addrs1.address, 5)
      await expect(
        vending.connect(addrs1).transferFrom(owner.address, addrs1.address, 5),
      ).to.be.reverted
      const ownerBalance = await vending.balanceOf(owner.address)
      const addr1Balance = await vending.balanceOf(addrs1.address)
      expect(ownerBalance).to.equal(addr1Balance).to.equal(5)
    })
    it('Test Mint', async function () {
      await vending.mint(owner.address, 10)
      expect(await vending.totalSupply()).to.equal(initalFunds + 10)

      const ownerBalance = await vending.balanceOf(owner.address)
      expect(ownerBalance).to.equal(10)
    })
  })
  describe('Fail', function () {
    it('Buy Something With no Funds', async function () {
      await expect(vending.buy(0)).to.be.revertedWith('Out of Stock')
    })
  })
})
