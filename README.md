## Questions

Only one wallet address per user?

## Project setup info

- Sepolia testnet for blockchain.
- Alchemy for RPC provider to interact with Sepolia.
- AAVE USDC faucet to deposit tokens to my wallet address.

1. Install project packages using `yarn`, make sure you are in root directory.

```bash
    yarn install
```

2. Use Docker to host database locally, run this command to spin up quick Postgresql DB

```bash
    docker run -d --name trust-wallet-dev -e POSTGRES_PASSWORD=postgres -e POSTGRES_USER=postgres -e POSTGRES_DB=trust-wallet-dev -p 5432:5432 postgres
```

3. Create `.env` file in the root from `.env.example` file, please refer to Alchemy docs to create SEPOLIA_API_KEY or I can share mine.

4. Run Prisma migrations on Postgresql DB

```bash
    npx prisma migrate dev
```

## Accounting

Working with decimals in JavaScript is HARD. Prisma offers `Decimal` field type which relies on `decimal.js` library for storing and applying calculations on decimal numbers. We can store 18 digit number + 6 decimal places.
This should be more then enough for out app needs.

#### Notes

Block numbers: 5583540, 5592426
