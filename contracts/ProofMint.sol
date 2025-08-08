// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
contract ProofMint is ERC721URIStorage{uint256 public nextId;constructor(string memory name_,string memory symbol_) ERC721(name_,symbol_){}
function mintWithURI(address to,string memory uri) external returns(uint256){address mintTo=to==address(0)?msg.sender:to;uint256 tokenId=++nextId;_safeMint(mintTo,tokenId);_setTokenURI(tokenId,uri);return tokenId;}}
