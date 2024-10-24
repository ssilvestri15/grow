// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

contract NFT {

    string public name;
    string public symbol;
    address contractOwner;
    mapping(address => bytes32) public tokenOwner;
    mapping(bytes32 => bool) public  tokenExists;

    event Minted(bytes32 token, address owner);
    event Transfer(address from, address to, bytes32 token);
    event Burned(bytes32 token);

    constructor(string memory _name, string memory _symbol, address _contractOwner) {
        name = _name;
        symbol = _symbol;
        contractOwner = _contractOwner;
    }

    function mint(address to) external onlyOwner{
        require(to != address(0), "Cannot mint to zero address");
        require(tokenOwner[to] == 0, "Recipient already owns a token");
        //generate a random token
        bytes32 token = keccak256(abi.encodePacked(block.prevrandao, block.timestamp));
        while (tokenExists[token]) {
            token = keccak256(abi.encodePacked(token, block.timestamp));
        }
        tokenExists[token] = true;
        tokenOwner[to] = token;
        emit Minted(token, to);
    }

    function transferOwnership(address to) external {
        require(to != address(0), "Cannot transfer to zero address");
        require(tokenOwner[msg.sender] != 0, "You do not own any token");
        require(tokenOwner[to] == 0, "Recipient already owns a token");
        bytes32 token = tokenOwner[msg.sender];
        delete tokenOwner[msg.sender];
        tokenOwner[to] = token;
        emit Transfer(msg.sender, to, token);
    }

    function burn() external {
        require(tokenOwner[msg.sender] != 0, "You do not own any token");
        bytes32 token = tokenOwner[msg.sender];
        delete tokenOwner[msg.sender];
        delete tokenExists[token];
        emit Burned(token);
    }

    modifier onlyOwner() {
        require(contractOwner == msg.sender, "Caller can't create NFT");
        _;   
    }
}
