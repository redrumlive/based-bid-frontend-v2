# OpenBid workflow reference

## Setup

```sh
git clone https://github.com/basedbid-public/openbid.git
cd openbid
npm install
```

## Environment

- EVM signing: `PRIVATE_KEY`
- Solana signing: `SOLANA_PRIVATE_KEY`
- Custom board access: `BASEDBID_API_KEY`

The API key is not required when the board field is omitted and the launch uses the default `based` board. A non-empty custom board value requires the key for launch and metadata requests.

## Wallet commands

```sh
npm run wallet:evm
npm run wallet:solana
```

## EVM commands

```sh
npm run evm:create-lbp
npm run evm:create-board
npm run evm:create-flash-token
npm run evm:lbp-buy
npm run evm:lbp-sell
npm run evm:claim-fees
```

The public repository documents Ethereum, Base, and BNB Smart Chain support for EVM workflows.

## Solana commands

```sh
npm run solana:create-lbp
npm run solana:create-board
npm run solana:create-flash-token
npm run solana:lbp-buy
npm run solana:lbp-sell
npm run solana:claim-lbp-fees
npm run solana:claim-flash-fees
```

## Configuration paths

- EVM configuration: `src/helpers/configs/evm/`
- Solana configuration: `src/helpers/configs/solana/`

Read the matching JSON file before changing values. Do not assume that EVM and Solana schemas use identical board fields.

## Validation checklist

- Correct network family and chain
- Valid signing-key environment variable present
- Wallet funded for network fees and requested value
- Token metadata complete
- Quote asset and amounts valid for the selected network
- Board value empty for the default board or paired with an API key for a custom board
- Fee, liquidity, market-cap, allocation, and timing values within current SDK constraints
