// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFT is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    uint public tokenCount;

    constructor() ERC721("Dapp NFT", "DAPP") {}

    function mint(string memory _tokenURI) external returns (uint) {
        uint256 currentTokenId = _tokenIds.current();

        _safeMint(msg.sender, currentTokenId);
        _setTokenURI(currentTokenId, _tokenURI);
        tokenCount = currentTokenId;
        _tokenIds.increment();
        return currentTokenId;
    }

    

}
