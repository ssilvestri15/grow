// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

contract NFT {

    string public name;
    string public symbol;
    address public contractCreator;
    address public contractOwner;
    mapping(address => bytes32) public tokenOwner;
    mapping(bytes32 => bool) public  tokenExists;
    bool private initialized; // Prevent double initialization

    event Minted(bytes32 token, address owner);
    event Transfer(address from, address to, bytes32 token);
    event Burned(bytes32 token);


    constructor() {
        initialized = false;
    }

    function initialize(string memory _name, string memory _symbol, address _contractCreator) external {
        require(!initialized, "Already initialized");
        name = _name;
        symbol = _symbol;
        contractCreator = _contractCreator;
        initialized = true;
    }

    function setOwner(address _contractOwner) external onlyCreator {
        contractOwner = _contractOwner;
    }

    function mint(address to) external onlyOwner {
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

    function getNFTToken(address userAddress) external view returns (bytes32) {
        require(tokenOwner[userAddress] != 0, "User do not own any token");
        return tokenOwner[userAddress];
    }

    modifier onlyOwner() {
        require(contractOwner == msg.sender, "Caller can't create NFT");
        _;   
    }

    modifier onlyCreator() {
        require(contractCreator == msg.sender, "Caller can't edit this parameter of the NFT");
        _;   
    }
}
