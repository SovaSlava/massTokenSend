const { expect } = require("chai");
const USDT = require("./USDT.js")
const massSendData = require("./massSend.js")


describe("MassSend", async  function() {
    let signers;
    let USDTContract;
    let massSendContract;
    let massSend;
    let moneyBoss = "0x28C6C06298D514DB089934071355E5743BF21D60";
    let receiver1 = "0x7aC426eE8B1aB48e160E75705A6641956E37F21A";
    let receiver2 = "0x3c20D39a6C627326Bf034A4f7B9E83509E41afaf";

    before(async () => {
        let MassSend = await ethers.getContractFactory("massSend");
        massSend = await MassSend.deploy();
        await massSend.deployed();

        console.log("massSend contract deployed to:", massSend.address);
    })  

    beforeEach(async function() {
        signers =  await ethers.getSigners();
        USDTContract = new ethers.Contract(USDT.address, USDT.abi, signers[0]);
        massSendContract = new ethers.Contract(massSend.address, massSendData.abi, signers[0]);
    })


    it('Our USDT balance > 100', async () => {
        let myBalance = await USDTContract.balanceOf(moneyBoss);
        expect(myBalance).to.be.above(100);
    })


    it("massSend contract's USDT balance is 0", async () => {
        let massSendBalance = await USDTContract.balanceOf(massSendContract.address);
        expect(massSendBalance).eq(0);
    })


    it('Transfer USDT to massSend contract', async function() {
        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [moneyBoss]}
        )
        const signer = await ethers.provider.getSigner(moneyBoss)
        await USDTContract.connect(signer).transfer(massSendContract.address, 100);
        let massSendBalance = await USDTContract.balanceOf(massSendContract.address);
        expect(massSendBalance).eq(100);
    })


    it("Transfer USDT tokens via massSend contract", async () => {
        let receiver1Balance = await USDTContract.balanceOf(receiver1);
        let receiver2Balance = await USDTContract.balanceOf(receiver2);
        await massSendContract.send([receiver1, receiver2], [10,10], USDTContract.address);
        expect((await USDTContract.balanceOf(receiver1)).toNumber(), receiver1Balance + 10)
        expect((await USDTContract.balanceOf(receiver2)).toNumber(), receiver2Balance + 10)
        expect((await USDTContract.balanceOf(massSendContract.address)).toNumber()).eq(80);
    })


    it("Revert, if call send function in massSend not owner", async () => {
        await expect(massSendContract.connect(signers[1]).send([moneyBoss, moneyBoss], [10,10], USDTContract.address)).to.be.reverted;
    })


    it("No one can change the address except the owner", async () => {
        await expect(massSendContract.connect(signers[1]).setOwner(signers[1])).to.be.reverted;
    })


    it("Owner can change owner address", async () => {
        await massSendContract.setOwner(moneyBoss);
        expect((await massSendContract.owner()).toUpperCase()).eq(moneyBoss.toUpperCase())
    })

});




