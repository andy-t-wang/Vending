# Wonky Vending Machine

## Quick start

The first things you need to do are cloning this repository and installing its
dependencies:

```sh
Clone the repo
cd vending
npm install
```

Once installed, let's run Hardhat's testing network:

```sh
npx hardhat node
```

Then, on a new terminal, go to the repository's root folder and run this to
deploy your contract:

```sh
npx hardhat run scripts/deploy.js --network localhost
```

Finally, we can run the frontend with:

```sh
cd frontend
npm install
npm start
```

To get VEND tokens in order to buy things from the machine call

```sh
npx hardhat --network localhost faucet [-your address]
```

<img width="852" alt="Screen Shot 2021-07-08 at 6 20 23 PM" src="https://user-images.githubusercontent.com/41224501/124998196-fd18d780-e019-11eb-9956-aabbcd2a3562.png">

