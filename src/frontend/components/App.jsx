import './App.css';
import { ethers } from 'ethers';
import { useState } from 'react';
import MarketplaceAddress from '../contractsData/Marketplace-address.json'
import MarketplaceABI from '../contractsData/Marketplace.json'
import NFTAddress from '../contractsData/NFT-address.json'
import NFTABI from '../contractsData/NFT.json'
import Navigation from './Navbar';
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import { Spinner } from 'react-bootstrap';
import Home from './Home'
import Create from './Create';
import MyListedItems from './MyListedItems'
import MyPurchses from './MyPurchses'
 
function App() {
  const [loading, setLoading] = useState(true)
  const [account, setAccount] = useState(null);
  const [nft, setNFT] = useState({});
  const [marketplace, setmarketplace] = useState({});


  const web3Handler = async() => {
    const accounts = await window.ethereum.request({method: 'eth_requestAccounts'});
    setAccount(accounts[0]);

    const provider = new ethers.providers.Web3Provider(window.ethereum);

    const signer = provider.getSigner();

    loadContract(signer)

  }

  const loadContract = (signer) => {
    const marketplace = new ethers.Contract(MarketplaceAddress.address, MarketplaceABI.abi, signer);
    setmarketplace(marketplace);
    const nft = new ethers.Contract(NFTAddress.address, NFTABI.abi, signer);
    
    setNFT(nft);
    
    setLoading(false)

  }
  return (
    <BrowserRouter>
      <div className="App">
        <>
          <Navigation web3Handler={web3Handler} account={account} />
        </>
        <div>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
              <Spinner animation="border" style={{ display: 'flex' }} />
              <p className='mx-3 my-0'>Awaiting Metamask Connection...</p>
            </div>
          ) : (
            <Routes>
              <Route path="/" element={
                <Home marketplace={marketplace} nft={nft}/>
              } />
              <Route path="/create" element={
                <Create marketplace={marketplace} nft={nft}/>
              } />
              <Route path="/my-listed-items" element={
                <MyListedItems marketplace={marketplace} nft={nft} account={account}/>
              } />
              <Route path="/my-purchases" element={
                <MyPurchses marketplace={marketplace} nft={nft} account={account}/>
              } />
            </Routes>
          )}
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
