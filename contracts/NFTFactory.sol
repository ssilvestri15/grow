// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "./NFT.sol";

contract NFTFactory {
    NFT public immutable nftImplementation; // Base implementation
    mapping (string => address) nftContracts;
    event NFTContractCreated(string name, string symbol);

    constructor() {
        nftImplementation = new NFT();
    }

    function createNFTContract(string memory _name, string memory _symbol) public returns (address) {
        string memory id = string.concat(_name, _symbol);
        require(nftContracts[id] == address(0), "NFT contract already exists");
        address nftAddressProxy = createClone(address(nftImplementation));
        NFT(nftAddressProxy).initialize(
            _name, 
            _symbol, 
            msg.sender
        );
        nftContracts[id] = nftAddressProxy; // Salva il contratto NFT appena creato
        emit NFTContractCreated(_name, _symbol);
        return nftAddressProxy; // Restituisce il nuovo contratto NFT
    }

    function getNFTContract(string memory _name, string memory _symbol) public view returns (address) {
        string memory id = string.concat(_name, _symbol);
        return nftContracts[id];
    }

        // EIP-1167 clone function
    function createClone(address target) internal returns (address result) {
        bytes20 targetBytes = bytes20(target);
        assembly {
            let clone := mload(0x40)
            mstore(clone, 0x3d602d80600a3d3981f3363d3d373d3d3d363d73000000000000000000000000)
            mstore(add(clone, 0x14), targetBytes)
            mstore(add(clone, 0x28), 0x5af43d82803e903d91602b57fd5bf30000000000000000000000000000000000)
            result := create(0, clone, 0x37)
        }
    }
}
