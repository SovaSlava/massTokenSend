const { expect } = require('chai');
const { ethers } = require('hardhat');
const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { profileEVM } = require('@1inch/solidity-utils');

const USDTData = require('./USDT.js');

async function logGasCost(label, tx) {
    const { cumulativeGasUsed } = await tx.wait();
    console.log(label, cumulativeGasUsed.toBigInt());
    return cumulativeGasUsed.toBigInt();
};

describe('MassSend', () => {
    let signer0, signer1;
    const moneyBoss = '0x28C6C06298D514DB089934071355E5743BF21D60';
    const receiver1 = '0xdead00000000000000beaf0000000000000dead1';
    const receiver2 = '0xdead00000000000000beaf0000000000000dead2';
    const receiver3 = '0xdead00000000000000beaf0000000000000dead3';
    const receiver4 = '0xdead00000000000000beaf0000000000000dead4';

    before(async () => {
        [signer0, signer1] =  await ethers.getSigners();
    });

    async function initContracts() {
        const USDT = new ethers.Contract(USDTData.address, USDTData.abi, signer0);

        const MassSend = await ethers.getContractFactory('MassSend');
        const massSend = await MassSend.deploy();
        await massSend.deployed();

        return { USDT, massSend };
    };

    async function getTokens(USDT, to, amount) {
        await hre.network.provider.request({
                method: 'hardhat_impersonateAccount',
                params: [moneyBoss],
            }
        );
        const signer = await ethers.provider.getSigner(moneyBoss);
        await USDT.connect(signer).transfer(to, amount);
    }

    async function initContractsAndGetTokens() {
        const { USDT, massSend } = await initContracts();

        await getTokens(USDT, massSend.address, 100);

        return { USDT, massSend };
    };

    it('Our USDT balance > 100', async () => {
        const { USDT } = await loadFixture(initContracts);
        const myBalance = await USDT.balanceOf(moneyBoss);
        expect(myBalance).to.be.above(100);
    });


    it('massSend contract\'s USDT balance is 0', async () => {
        const { USDT, massSend } = await loadFixture(initContracts);
        const massSendBalance = await USDT.balanceOf(massSend.address);
        expect(massSendBalance).eq(0);
    });


    it('Transfer USDT to massSend contract', async () => {
        const { USDT, massSend } = await loadFixture(initContracts);

        await getTokens(USDT, massSend.address, 100);

        const massSendBalance = await USDT.balanceOf(massSend.address);
        expect(massSendBalance).eq(100);
    });


    it('Transfer USDT tokens via massSend contract', async () => {
        const { USDT, massSend } = await loadFixture(initContractsAndGetTokens);

        const tx = await massSend.send([receiver1, receiver2], [10, 10], USDT.address);

        await expect(tx).to.changeTokenBalances(
            USDT,
            [receiver1, receiver2, massSend],
            [10, 10, -20],
        );
    });


    it('Revert, if call send function in massSend not owner', async () => {
        const { USDT, massSend } = await loadFixture(initContractsAndGetTokens);
        await expect(massSend.connect(signer1).send([moneyBoss, moneyBoss], [10,10], USDT.address)).to.be.reverted;
    });


    it('No one can change the address except the owner', async () => {
        const { massSend } = await loadFixture(initContracts);
        await expect(massSend.connect(signer1).setOwner(signer1.address)).to.be.revertedWithCustomError(massSend, 'OnlyOwner');
    });


    it('Owner can change owner address', async () => {
        const { massSend } = await loadFixture(initContracts);
        await massSend.setOwner(moneyBoss);
        expect((await massSend.owner()).toUpperCase()).eq(moneyBoss.toUpperCase())
    });

    describe('Compare gas cost', () => {
        let oneTransferCostToNewestAddress, oneTransferCostToUsedAddress;

        before(async () => {
            const { USDT } = await loadFixture(initContractsAndGetTokens);
            await getTokens(USDT, signer1.address, 100);
            const tx = await USDT.connect(signer1).transfer(receiver3, 10);
            oneTransferCostToNewestAddress = await logGasCost('send to single newest addresses gasUsed(one):', tx);
            const tx2 = await USDT.connect(signer1).transfer(receiver3, 10);
            oneTransferCostToUsedAddress = await logGasCost('send to single addresses gasUsed(one):', tx2);
        });

        it('Compare gas cost for transfer to 2 new addresses', async () => {
            const { USDT, massSend } = await loadFixture(initContractsAndGetTokens);

            const tx = await massSend.send([receiver1, receiver2], [10, 10], USDT.address);
            const gasUsed = await logGasCost('multisend to 2 newest addresses gasUsed:', tx);

            console.log('gasUsedSeparateTransfers:', oneTransferCostToNewestAddress * 2n);

            const diff = oneTransferCostToNewestAddress * 2n - gasUsed;
            console.log('gas diff:', diff);
            console.log('percentage:', diff * 100n / 2n / oneTransferCostToNewestAddress);
        });

        it('Compare gas cost for transfer to 4 new addresses', async () => {
            const { USDT, massSend } = await loadFixture(initContractsAndGetTokens);

            const tx = await massSend.send([receiver1, receiver2, receiver3, receiver4], [10, 10, 10, 10], USDT.address);
            const gasUsed = await logGasCost('multisend to 4 newest addresses gasUsed:', tx);

            console.log('gasUsedSeparateTransfers:', oneTransferCostToNewestAddress * 4n);

            const diff = oneTransferCostToNewestAddress * 4n - gasUsed;
            console.log('gas diff:', diff);
            console.log('percentage:', diff * 100n / 4n / oneTransferCostToNewestAddress);
        });

        it('Compare gas cost for transfer to 2 addresses with not-zero amount', async () => {
            const { USDT, massSend } = await loadFixture(initContractsAndGetTokens);
            await getTokens(USDT, signer1.address, 100);
            await massSend.send([receiver1, receiver2], [10, 10], USDT.address);

            const tx1 = await massSend.send([receiver1, receiver2], [10, 10], USDT.address);
            const gasUsed = await logGasCost('multisend to 2 addresses gasUsed:', tx1);

            console.log('gasUsedSeparateTransfers:', oneTransferCostToUsedAddress * 2n);

            const diff = oneTransferCostToUsedAddress * 2n - gasUsed;
            console.log('gas diff:', diff);
            console.log('percentage:', diff * 100n / 2n / oneTransferCostToUsedAddress);
        });

        it('Compare gas cost for transfer to 4 addresses with not-zero amount', async () => {
            const { USDT, massSend } = await loadFixture(initContractsAndGetTokens);
            await massSend.send([receiver1, receiver2, receiver3, receiver4], [10, 10, 10, 10], USDT.address);

            const tx1 = await massSend.send([receiver1, receiver2, receiver3, receiver4], [10, 10, 10, 10], USDT.address);
            const gasUsed = await logGasCost('multisend to 4 addresses gasUsed:', tx1);

            console.log('gasUsedSeparateTransfers:', oneTransferCostToUsedAddress * 4n);

            const diff = oneTransferCostToUsedAddress * 4n - gasUsed;
            console.log('gas diff:', diff);
            console.log('percentage:', diff * 100n / 4n / oneTransferCostToUsedAddress);
        });
    });
});
