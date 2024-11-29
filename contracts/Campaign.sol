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
    address public immutable owner;
    address public immutable creator;
    string public imageBannerUrl;
    string public imagePosterUrl;
    uint256 public immutable targetAmount;
    uint256 public immutable startDate;
    uint256 public immutable deadline;
    NFT public immutable nftContract;

    mapping(address => Donation[]) private _donations; // Private to minimize gas on external calls
    mapping(address => uint256) public totalDonated;
    address[] private _donorAddresses; // Avoid exposing directly to reduce gas

    event Donated(address indexed donor, uint256 amount);
    event FundsWithdrawn(address indexed owner, uint256 amount);
    event RefundFailed(address indexed donor, uint256 amount, string reason);
    event CampaignClosed(string title);
    event RefundAllSuccess(address indexed campaignAddress);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    modifier onlyCreator() {
        require(msg.sender == creator, "Only the creator can call this function");
        _;
    }

    constructor(
        string memory _title,
        string memory _description,
        address _owner,
        address _creator,
        string memory _imageBannerUrl,
        string memory _imagePosterUrl,
        uint256 _targetAmount,
        uint256 _duration, // Duration in days
        address _nftContract
    ) {
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
    }

    function donate() public payable {
        require(msg.value > 0, "Donation must be greater than zero");
        require(block.timestamp <= deadline, "The campaign is closed");

        if (totalDonated[msg.sender] == 0) {
            _donorAddresses.push(msg.sender);
            nftContract.mint(msg.sender); // Mint NFT only for first-time donors
        }

        totalDonated[msg.sender] += msg.value;
        _donations[msg.sender].push(Donation({amount: msg.value, timestamp: block.timestamp}));

        emit Donated(msg.sender, msg.value);
    }

    function withdrawFunds() external onlyCreator {
        require(block.timestamp >= deadline, "The campaign is still active");
        require(address(this).balance >= targetAmount, "Target amount not reached");

        uint256 amount = address(this).balance;
        (bool success, ) = payable(owner).call{value: amount}("");
        require(success, "Transfer failed");

        emit FundsWithdrawn(owner, amount);
    }

    function refundBatch(uint256 start, uint256 end) external onlyCreator {
        require(block.timestamp >= deadline, "The campaign is still active");

        for (uint256 i = start; i < end && i < _donorAddresses.length; i++) {
            address donor = _donorAddresses[i];
            uint256 amountToRefund = totalDonated[donor];
            if (amountToRefund > 0) {
                totalDonated[donor] = 0;
                (bool sent, ) = payable(donor).call{value: amountToRefund}("");
                if (!sent) {
                    totalDonated[donor] = amountToRefund; // Revert state if refund fails
                    emit RefundFailed(donor, amountToRefund, "");
                }
            }
        }

        emit RefundAllSuccess(address(this));
    }

    function getUserDonations(address userAddress) external view returns (Donation[] memory) {
        return _donations[userAddress];
    }

    function getDonorAddresses() external view returns (address[] memory) {
        return _donorAddresses;
    }

    function getNftContract() external view onlyOwner returns (address) {
        return address(nftContract);
    }
}
