// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "./ParticipationNFT.sol";

contract NFTFactory {
    ParticipationNFT[] public nftContracts; // Lista dei contratti NFT creati
    event NFTContractCreated(address nftAddress);

    function createNFTContract(string memory _name, string memory _symbol) public returns (ParticipationNFT) {
        ParticipationNFT nft = new ParticipationNFT(_name, _symbol);
        nftContracts.push(nft);
        emit NFTContractCreated(address(nft));
        return nft; // Restituisce l'indirizzo del nuovo contratto NFT
    }

    function getNFTContracts() public view returns (ParticipationNFT[] memory) {
        return nftContracts; // Restituisce tutti i contratti NFT creati
    }
}
