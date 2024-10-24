// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

contract ParticipationNFT {
    string public name;
    string public symbol;
    uint256 public nextTokenId;
    mapping(uint256 => address) public tokenOwner;

    event Minted(uint256 tokenId, address owner);

    constructor(string memory _name, string memory _symbol) {
        name = _name;
        symbol = _symbol;
    }

    function mint(address to) external {
        require(to != address(0), "Cannot mint to zero address");
        
        tokenOwner[nextTokenId] = to;
        emit Minted(nextTokenId, to);
        nextTokenId++;
    }
}
