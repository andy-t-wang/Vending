require('@nomiclabs/hardhat-waffle')
require('@nomiclabs/hardhat-ganache')

// The next line is part of the sample project, you don't need it in your
// project. It imports a Hardhat task definition, that can be used for
// testing the frontend.
require('./tasks/faucet')

module.exports = {
  networks: {
    ganache: {
      url: 'HTTP://127.0.0.1:7545',
      // accounts: [privateKey1, privateKey2, ...]
    },
  },
  solidity: '0.8.0',
}
