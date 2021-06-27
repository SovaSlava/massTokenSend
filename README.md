# Mass token send in one transaction

### What is it?
 If you want to send ERC-20 tokens to many addresses, saving on gas, use my smart contract.
1. Deploy `massSend.sol` smart contract from contracts folder
2. Transfer the required number of tokens from contract(For example: USDT - 0xdac17f958d2ee523a2206206994597c13d831ec7) to massSend contract
3. Call `send` function with arguments: address[] receivers, uint[] amounts, address contractAdress

| Transfer to         | Usualy gas amount | Gas amount when use massSend contract |
| :------------- |-------------:| -----:|
| 2 new addresses    | 126346 | 100949 |
| 3 new addresses    | 189519 | 129791 |
| 2 addresses with token balance | 92146 | 66749 |
| 3 addresses with token balance | 138219 | 78491 |



#### Example:
`send:  [0x01, 0x02, 0x03], [10, 20, 30], 0xdac17f958d2ee523a2206206994597c13d831ec7`



### Getting started
 1. Open terminal
 2. Clone the repo: `git clone https://github.com/SlavikDMI/massTokenSend.git`
 3. Run `npm i` to install node packages.
 4. Register at https://alchemyapi.io and paste your api key into hardhat.config.js
 5. Run `npx hardhat node`
 6. Run in other terminal tab `npx hardhat test`
