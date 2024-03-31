## Questions

Only one wallet address per user?

Block numbers: 5583540, 5592426

## Notes

Some key notes and considirations that I have notices while working on project

### Accounting

Working with decimals in JavaScript is HARD. Prisma offers `Decimal` field type which relies on `decimal.js` library for storing and applying calculations on decimal numbers. We can store 18 digit number + 6 decimal places.
This should be more then enough for out app needs.

### Endpoint description

1. Create User

- I have used `email` as request param.
- I have used `ethers` library for creating random wallet fo user.

2. Scan Block

- I have used `email` and `blocknumber` as request params.
- Since we are dealing with only one blockchain, we can rely on transaction hash as idempotency key.
  That just means, we cannot get double balance increments because of `UNIQUE` flag on tx hash.

3. Withdraw

- I think we need some kind of nonce as well, that will come client side for preventing double spending problem. I have used `withdrawNonce` that increments every time we process withdraw request.
