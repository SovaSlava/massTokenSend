const { expect } = require("chai");
const { ethers } = require('hardhat');
const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');

const USDTData = require("./USDT.js")
const massSendData = require("./massSend.js")


describe("MassSend", async  () => {
    let signer0, signer1;
    const moneyBoss = "0x28C6C06298D514DB089934071355E5743BF21D60";
    const receiver1 = "0xdead0000000000000000000000000000000dead1";
    const receiver2 = "0xdead0000000000000000000000000000000dead2";

    async function initContracts() {
        const USDT = new ethers.Contract(USDTData.address, USDTData.abi, signer0);

        const MassSend = await ethers.getContractFactory("massSend");
        const massSend = await MassSend.deploy();
        await massSend.deployed();

        return { USDT, massSend };
    };

    async function getTokens(USDT, massSendAddress, amount) {
        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [moneyBoss]}
        )
        const signer = await ethers.provider.getSigner(moneyBoss)
        await USDT.connect(signer).transfer(massSendAddress, amount);
    }

    async function initContractsAndGetTokens() {
        const { USDT, massSend } = await initContracts();

        await getTokens(USDT, massSend.address, 100);

        return { USDT, massSend };
    };

    before(async () => {
        [signer0, signer1] =  await ethers.getSigners();
    });

    it('Our USDT balance > 100', async () => {
        const { USDT } = await loadFixture(initContracts);
        const myBalance = await USDT.balanceOf(moneyBoss);
        expect(myBalance).to.be.above(100);
    });


    it("massSend contract's USDT balance is 0", async () => {
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


    it("Transfer USDT tokens via massSend contract", async () => {

        const { USDT, massSend } = await loadFixture(initContractsAndGetTokens);

        const tx = await massSend.send([receiver1, receiver2], [10, 10], USDT.address);

        await expect(tx).to.changeTokenBalances(
            USDT,
            [receiver1, receiver2, massSend],
            [10, 10, -20]
          );
    });


    it("Revert, if call send function in massSend not owner", async () => {
        const { USDT, massSend } = await loadFixture(initContractsAndGetTokens);
        await expect(massSend.connect(signer1).send([moneyBoss, moneyBoss], [10,10], USDT.address)).to.be.reverted;
    });


    it("No one can change the address except the owner", async () => {
        const { massSend } = await loadFixture(initContracts);
        await expect(massSend.connect(signer1).setOwner(signer1.address)).to.be.revertedWithCustomError(massSend, 'OnlyOwner');
    });


    it("Owner can change owner address", async () => {
        const { massSend } = await loadFixture(initContracts);
        await massSend.setOwner(moneyBoss);
        expect((await massSend.owner()).toUpperCase()).eq(moneyBoss.toUpperCase())
    });
});
