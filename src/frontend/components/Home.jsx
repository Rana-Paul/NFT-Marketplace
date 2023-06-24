import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Row, Col, Card, Button } from "react-bootstrap";

function Home({ marketplace, nft }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadMarketPlace = async () => {
    const itemCount = await marketplace.itemCount();

    let items = [];
    for (let index = 1; index <= itemCount; index++) {
      const item = await marketplace.items(index);

      if (!item.sold) {
        const uri = await nft.tokenURI(item.tokenId);

        //use URI to fetch the NFT data
        console.log(uri);
        const data = await fetch(uri).then((response) => response.json());

        const totalPrice = await marketplace.getTotalPrice(item.itemId);
        console.log("total price err..." + totalPrice);

        items.push({
          totalPrice,
          itemId: item.itemId,
          seller: item.seller,
          name: data.name,
          description: data.description,
          image: data.image,
        });
      }
    }
    setItems(items);
    setLoading(false);
  };

  const buyMarketItem = async (item) => {
    await (
      await marketplace.purchaseItem(item.itemId, { value: item.totalPrice })
    ).wait();
    loadMarketPlace();
  };

  useEffect(() => {
    loadMarketPlace();
  }, []);

  if (loading)
    return (
      <main style={{ padding: "1rem 0" }}>
        <h2>Loading...</h2>
      </main>
    );
  return (
    <div className="flex justify-center">
      {items.length > 0 ? (
        <div className="px-5 container">
          <Row xs={1} md={2} lg={4} className="g-4 py-5">
            {items.map((item, idx) => (
              <Col key={idx} className="overflow-hidden">
                <Card>
                  <Card.Img variant="top" src={item.image} />
                  <Card.Body color="secondary">
                    <Card.Title>{item.name}</Card.Title>
                    <Card.Text>{item.description}</Card.Text>
                  </Card.Body>
                  <Card.Footer>
                    <div className="d-grid">
                      <Button
                        onClick={() => buyMarketItem(item)}
                        variant="primary"
                        size="lg"
                      >
                        Buy for {ethers.utils.formatEther(item.totalPrice)} ETH
                      </Button>
                    </div>
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      ) : (
        <main style={{ padding: "1rem 0" }}>
          <h2>No listed assets</h2>
        </main>
      )}
    </div>
  );
}

export default Home;
