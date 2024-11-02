// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "./NFT.sol";

contract NFTFactory {
    mapping (string => address) nftContracts;
    event NFTContractCreated(string name, string symbol);

    function createNFTContract(string memory _name, string memory _symbol) public returns (address) {
        string memory id = string.concat(_name, _symbol);
        require(nftContracts[id] == address(0), "NFT contract already exists");
        NFT nft = new NFT(_name, _symbol, msg.sender); // Crea un nuovo contratto NFT
        nftContracts[id] = address(nft); // Salva il contratto NFT appena creato
        emit NFTContractCreated(_name, _symbol);
        return address(nft); // Restituisce il nuovo contratto NFT
    }

    function getNFTContract(string memory _name, string memory _symbol) public view returns (address) {
        string memory id = string.concat(_name, _symbol);
        return nftContracts[id];
    }
}
