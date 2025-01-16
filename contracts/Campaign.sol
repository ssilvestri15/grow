// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "./NFT.sol";

contract Campaign {

      struct Donation {
        uint256 amount;
        uint256 timestamp;
    }

    string public title;
    string public description;
    address public owner;
    address public creator;
    string public imageBannerUrl;
    string public imagePosterUrl;
    uint256 public targetAmount;
    uint256 public startDate;
    uint256 public deadline;
    NFT public nftContract;

    mapping(address => Donation[]) private _donations;
    mapping(address => uint256) public totalDonated;
    mapping(address => uint256) private refundedAmounts;
    uint256 private amountReached;
    address[] private _donorAddresses;

    bool private initialized; // Prevent double initialization
    bool private withdrawn;

    event Donated(address indexed donor, uint256 amount);
    event FundsWithdrawn(address indexed owner, uint256 amount);
    event CampaignClosed(string title);
    event RefundClaimed(address indexed donor, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    modifier onlyCreator() {
        require(msg.sender == creator, "Only the creator can call this function");
        _;
    }
    
    constructor() {
        initialized = false;
        withdrawn = false;
        amountReached = 0;
    }

    function initialize(
        string memory _title,
        string memory _description,
        address _owner,
        address _creator,
        string memory _imageBannerUrl,
        string memory _imagePosterUrl,
        uint256 _targetAmount,
        uint256 _duration,
        address _nftContract
    ) external {
        require(!initialized, "Already initialized");
        owner = _owner;
        creator = _creator;
        title = _title;
        description = _description;
        imageBannerUrl = _imageBannerUrl;
        imagePosterUrl = _imagePosterUrl;
        targetAmount = _targetAmount;
        startDate = block.timestamp;
        deadline = startDate + (_duration * 1 days);
        nftContract = NFT(_nftContract);
        initialized = true;
    }

    function donate() public payable {
        require(msg.value > 0, "Donation must be greater than zero");
        require(block.timestamp <= deadline, "The campaign is closed");

        if (totalDonated[msg.sender] == 0) {
            _donorAddresses.push(msg.sender);
            nftContract.mint(msg.sender); // Mint NFT only for first-time donors
        }

        amountReached += msg.value;
        totalDonated[msg.sender] += msg.value;
        _donations[msg.sender].push(Donation({amount: msg.value, timestamp: block.timestamp}));

        emit Donated(msg.sender, msg.value);
    }

    function withdrawFunds() external onlyCreator {
        require(!withdrawn, "Funds have already been withdrawn");
        require(block.timestamp > deadline, "The campaign is still active");
        require(amountReached >= targetAmount, "Target amount not reached");

        uint256 amount = address(this).balance;
        withdrawn = true;

        (bool success, ) = payable(owner).call{value: amount}("");
        require(success, "Withdrawal failed");

        emit FundsWithdrawn(owner, amount);
    }

    function requestRefund() external {
        require(block.timestamp > deadline, "The campaign is still active");
        require(address(this).balance <= targetAmount, "Target reached, refund not allowed");
        require(totalDonated[msg.sender] > 0, "Nothing to refund");
        require(refundedAmounts[msg.sender] == 0, "Refund already requested");

        refundedAmounts[msg.sender] = totalDonated[msg.sender];

        (bool success, ) = payable(msg.sender).call{value: refundedAmounts[msg.sender]}("");
        require(success, "Refund failed");
        
        emit RefundClaimed(msg.sender, refundedAmounts[msg.sender]);
    }

    function getUserDonations(address userAddress) external view returns (Donation[] memory) {
        return _donations[userAddress];
    }

    function getDonorAddresses() external view returns (address[] memory) {
        return _donorAddresses;
    }

    function getNftContract() external view returns (address) {
        return address(nftContract);
    }
}
