# Mass token send in one transaction [SUPER GAS OPTIMIZED]

### What is it?

If you want to send ERC-20 tokens to many addresses, saving on gas, use this smart contract.

1. Deploy `massSend.sol` smart contract from contracts folder
2. Transfer the required number of tokens from contract(For example: USDT - 0xdac17f958d2ee523a2206206994597c13d831ec7) to massSend contract
3. Call `send` function with arguments: address[] receivers, uint[] amounts, address contractAdress

| Transfer to                    | Usualy gas amount | Gas amount when use massSend contract | Percentage |
| :----------------------------- | ----------------: | ------------------------------------: | ---------: |
| 2 new addresses                |            126034 |                                 97337 |        22% |
| 4 new addresses                |            252068 |                                152219 |        39% |
| 2 addresses with token balance |             91834 |                                 63137 |        31% |
| 4 addresses with token balance |            183668 |                                 83819 |        54% |

#### Example:

`send:  [0x01, 0x02, 0x03], [10, 20, 30], 0xdac17f958d2ee523a2206206994597c13d831ec7`

### Getting started

1.  Open terminal
2.  Clone the repo: `git clone https://github.com/SlavikDMI/massTokenSend.git`
3.  Run `npm i` to install node packages.
4.  Register at https://alchemyapi.io
5.  Create .env file like .env.example and paste your api key into .env
6.  Run `npm test`
