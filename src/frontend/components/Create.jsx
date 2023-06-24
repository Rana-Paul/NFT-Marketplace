import React, { useState } from "react";
import { ethers } from "ethers";
import { Row, Form, Button } from "react-bootstrap";
import axios from "axios";


function Create({ marketplace, nft }) {
  const [image, setImage] = useState("");
  const [price, setPrice] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");


  const uploadToIPFS = async (event) => {
    event.preventDefault();
    const file = event.target.files[0];

    if (typeof file !== "undefined") {
      try {
        const formData = new FormData();
        formData.append("file", file);

        const resFile = await axios({
          method: "post",
          url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
          data: formData,
          headers: {
            pinata_api_key: `6d2964e0c280894ac209`,
            pinata_secret_api_key: `5ad875c860b8b4642b11c6e0fd6f31dc901e12d9ed14de15dbba81c0ffa95a1e`,
            "Content-Type": "multipart/form-data",
          },
        });

        const ImgHash = `https://gateway.pinata.cloud/ipfs/${resFile.data.IpfsHash}`;
        setImage(ImgHash);
        //Take a look at your Pinata Pinned section, you will see a new file added to you list.
      } catch (error) {
        console.log("Error sending File to IPFS: ");
        console.log(error);
      }
    }
  };

  const mintingNFT = async () => {
    if (!image || !price || !name || !description) return;

    try {
      const metadata = JSON.stringify({ image, price, name, description });

      const result = await axios({
        method: "post",
        url: "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        data: metadata,
        headers: {
          pinata_api_key: `6d2964e0c280894ac209`,
          pinata_secret_api_key: `
          5ad875c860b8b4642b11c6e0fd6f31dc901e12d9ed14de15dbba81c0ffa95a1e`,
          "Content-Type": "application/json",
        },
      });

      mintThenList(result);
      setImage("");
      setName("");
      setPrice(null);
      setDescription("");
    } catch (error) {
      console.log("ipfs uri upload error: ", error);
    }
  };

  const mintThenList = async (result) => {
    const uri = `https://gateway.pinata.cloud/ipfs/${result.data.IpfsHash}`;

    await (await nft.mint(uri)).wait();
    const id = await nft.tokenCount();
    // approve marketplace to spend nft
    await (await nft.setApprovalForAll(marketplace.address, true)).wait();
    // add nft to marketplace
    const listingPrice = ethers.utils.parseEther(price.toString());
    await (await marketplace.makeItem(nft.address, id, listingPrice)).wait();
    alert("NFT Created Sucessfully")
  };
  return (
    <div className="container-fluid mt-5">
      <div className="row">
        <main
          role="main"
          className="col-lg-12 mx-auto"
          style={{ maxWidth: "1000px" }}
        >
          <div className="content mx-auto">
            <Row className="g-4">
              <Form.Control
                type="file"
                required
                name="file"
                onChange={uploadToIPFS}
              />
              <Form.Control
                onChange={(e) => setName(e.target.value)}
                size="lg"
                required
                type="text"
                placeholder="Name"
              />
              <Form.Control
                onChange={(e) => setDescription(e.target.value)}
                size="lg"
                required
                as="textarea"
                placeholder="Description"
              />
              <Form.Control
                onChange={(e) => setPrice(e.target.value)}
                size="lg"
                required
                type="number"
                placeholder="Price in ETH"
              />
              <div className="d-grid px-0">
                <Button onClick={mintingNFT} variant="primary" size="lg">
                  Create & List NFT!
                </Button>
              </div>
            </Row>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Create;
