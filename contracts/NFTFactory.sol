// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "./NFT.sol";

contract NFTFactory {
    mapping (string => address) nftContracts;
    event NFTContractCreated(address nftAddress);

    function createNFTContract(string memory _name, string memory _symbol) public returns (address) {
        string memory id = string.concat(_name, _symbol);
        require(nftContracts[id] == address(0), "NFT contract already exists");
        NFT nft = new NFT(_name, _symbol, address(this)); // Crea un nuovo contratto NFT
        nftContracts[id] = address(nft); // Salva il contratto NFT appena creato
        emit NFTContractCreated(address(nft));
        return address(nft); // Restituisce il nuovo contratto NFT
    }
}
