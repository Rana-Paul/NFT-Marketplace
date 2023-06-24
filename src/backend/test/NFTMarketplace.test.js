const { expect } = require("chai");
const { ethers } = require("hardhat");

const toWei = (num) => ethers.utils.parseEther(num.toString());
const fromatWei = (num) => ethers.utils.formatEther(num);

describe("NFTMarketplace", async function () {
  let deployer, add1, add2, nft, marketplace;
  let feePercent = 1;
  let URI = "testing URI";

  beforeEach(async function () {
    const NFT = await ethers.getContractFactory("NFT");
    const Marketplace = await ethers.getContractFactory("Marketplace");

    [deployer, add1, add2] = await ethers.getSigners();

    nft = await NFT.deploy();
    marketplace = await Marketplace.deploy(1);
  });

  describe("Deployment", function () {
    it("Track name & symbol of the NFT colection", async function () {
      expect(await nft.name()).to.equal("Dapp NFT");
      expect(await nft.symbol()).to.equal("DAPP");
    });
    it("Track feeAccount & feePercent", async function () {
      expect(await marketplace.feeAccount()).to.equal(deployer.address);
      expect(await marketplace.feePercent()).to.equal(feePercent);
    });
  });

  describe("Minting NFTs", function () {
    it("Track each minted NFT", async function () {
      // add1 mint a NFT
      await nft.connect(add1).mint(URI);
      expect(await nft.tokenCount()).to.equal(1);
      expect(await nft.balanceOf(add1.address)).to.equal(1);
      expect(await nft.tokenURI(1)).to.equal(URI);

      // add2 mint a NFT
      await nft.connect(add2).mint(URI);
      expect(await nft.tokenCount()).to.equal(2);
      expect(await nft.balanceOf(add1.address)).to.equal(1);
      expect(await nft.tokenURI(2)).to.equal(URI);
    });
  });

  describe("Making Marketplace Item", function () {
    beforeEach(async function () {
      await nft.connect(add1).mint(URI);

      // add1 approve marketplace to spend NFT
      await nft.connect(add1).setApprovalForAll(marketplace.address, true);
    });

    it("Transfer NFT from seller to Marketplace and emit Offered event", async function () {
      await expect(marketplace.connect(add1).makeItem(nft.address, 1, toWei(1)))
        .to.emit(marketplace, "Offered")
        .withArgs(1, nft.address, 1, toWei(1), add1.address);

      // Owner of NFT should be the Marketplace
      expect(await nft.ownerOf(1)).to.equal(marketplace.address);

      // ItemCount should be 1 now
      expect(await marketplace.itemCount()).to.equal(1);

      //get Item Details
      const item = await marketplace.items(1);
      expect(item.itemId).to.equal(1);
      expect(item.nft).to.equal(nft.address);
      expect(item.tokenId).to.equal(1);
      expect(item.price).to.equal(toWei(1));
      expect(item.sold).to.equal(false);
    });

    // Failure Case
    it("Fail if price set to zero", async function () {
      await expect(
        marketplace.connect(add1).makeItem(nft.address, 1, 0)
      ).to.be.revertedWith("Price must be greater than zero");
    });
  });

  describe("Purchasing Marketplace Items", function () {
    let price = 2;
    let totalPriceInWei;
    beforeEach(async function () {
      await nft.connect(add1).mint(URI);

      // add1 approve marketplace to spend NFT
      await nft.connect(add1).setApprovalForAll(marketplace.address, true);

      await marketplace.connect(add1).makeItem(nft.address, 1, toWei(price));
    });

    it("Should update item as sold, pay seller, transfer NFT t buyer, charge fees and emit Bought event", async function () {
      const sellerInitalBal = await add1.getBalance();
      const feeAccountInitialBal = await deployer.getBalance();

      totalPriceInWei = await marketplace.getTotalPrice(1);

      // add2 purchase item
      await expect(
        marketplace.connect(add2).purchaseItem(1, { value: totalPriceInWei })
      )
        .to.emit(marketplace, "Bought")
        .withArgs(1, nft.address, 1, toWei(price), add1.address, add2.address);

      const sellerFinalBal = await add1.getBalance();
      const feeAcountFinalBal = await deployer.getBalance();

      // seller recive payment
      expect(+fromatWei(sellerFinalBal)).to.equal(
        +price + +fromatWei(sellerInitalBal)
      );

      //calculate fee
      const fee = (feePercent / 100) * price;

      //feeAccount recive fee
      expect(+fromatWei(feeAcountFinalBal)).to.equal(
        +fee + +fromatWei(feeAccountInitialBal)
      );

      // Buyer is the owner of the NFT
      expect(await nft.ownerOf(1)).to.equal(add2.address);
      
      expect((await marketplace.items(1)).sold).to.equal(true);
    });

    it('Should fail for Invalid item ids, sold Items and when not enough ether is paid', async function() {
      await expect(marketplace.connect(add2).purchaseItem(2, {value: totalPriceInWei})).to.be.revertedWith("Item doesn't exist");
      await expect(marketplace.connect(add2).purchaseItem(0, {value: totalPriceInWei})).to.be.revertedWith("Item doesn't exist");
      await expect(marketplace.connect(add2).purchaseItem(1, {value: toWei(price)})).to.be.revertedWith("Please Provide the total Price");

      // add2 purche item-1
      await marketplace.connect(add2).purchaseItem(1, {value: totalPriceInWei});

      // deployer try to purchse item that already sold
      await expect(marketplace.connect(deployer).purchaseItem(1, {value: totalPriceInWei})).to.be.revertedWith("Item already sold");

    })
  });
});
