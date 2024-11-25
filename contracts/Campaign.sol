// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "./NFT.sol";

contract Campaign {

    struct DonationSummary {
        address donor;
        uint256 totalAmount;
        Donation[] donations;
    }

    struct Donation {
        address donor;
        uint256 amount;
        uint256 timestamp;
    }

    string public title;
    string public description;
    address public owner;
    address public creator;
    string public imageBannerUrl;
    string public imagePosterUrl;
    uint256 public targetAmount; // Obiettivo in Ether
    uint256 public currentAmount;
    mapping(address => DonationSummary) public donations;
    address[] public donorAddresses;
    uint256 public deadline;
    uint256 public startDate;
    NFT public nftContract; //Contratto per la creazione di NFT dedicato alla campagna

    event Donated(address indexed donor, uint256 amount);
    event FundsWithdrawn(address indexed owner, uint256 amount);
    event RefundFailed(address indexed donor, uint256 amount, string reason);
    event CampaignClosed(string title);
    event RefundAllSuccess(address indexed campaignAddress);

    constructor(
        string memory _title,
        string memory _description,
        address _owner,
        address _creator,
        string memory _imageBannerUrl,
        string memory _imagePosterUrl,
        uint256 _targetAmount,
        uint256 _duration, // Durata in giorni
        address _nftContract
    ) {
        title = _title;
        description = _description;
        owner = _owner;
        creator = _creator;
        imageBannerUrl = _imageBannerUrl;
        imagePosterUrl = _imagePosterUrl;
        targetAmount = _targetAmount;
        startDate = block.timestamp;
        deadline = startDate + (_duration * 86400); // Conversione giorni -> secondi
        currentAmount = 0;
        nftContract = NFT(_nftContract);
    }

    function donate() external payable {
        require(msg.value > 0, "Donation must be greater than zero");
        require(block.timestamp >= deadline, "The campaign is still active");
        
        if (donations[msg.sender].totalAmount == 0) {
            donorAddresses.push(msg.sender);
            // Mint NFT for new donors
            nftContract.mint(msg.sender);
        }
        
        donations[msg.sender].totalAmount += msg.value;
        donations[msg.sender].donations.push(Donation(msg.sender, msg.value, block.timestamp));
        currentAmount += msg.value;
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

    function refundAll() external onlyCreator {
        require(block.timestamp >= deadline, "The campaign is still active");
        
        for (uint256 i = 0; i < donorAddresses.length; i++) {
            uint256 amountToRefund = donations[donorAddresses[i]].totalAmount;
            if (amountToRefund > 0) {
                donations[donorAddresses[i]].totalAmount = 0;
                (bool sent, ) = payable(donorAddresses[i]).call{value: amountToRefund}("");
                if (!sent) {
                    donations[donorAddresses[i]].totalAmount = amountToRefund;
                    emit RefundFailed(donorAddresses[i], amountToRefund, "");
                }
            }
        }

        emit RefundAllSuccess(address(this));
    }

    function rufund(address donor) external onlyCreator {
        require(block.timestamp >= deadline, "The campaign is still active");
        uint256 refundAmount = donations[donor].totalAmount;
        require(refundAmount > 0, "No failed refund for this donor");
        require(address(this).balance >= refundAmount, "Contract balance is insufficient");
        
        donations[donor].totalAmount = 0;
        (bool success, ) = payable(donor).call{value: refundAmount}("");
        require(success, "Refund failed");
    }

    function getUserDonations(address userAddress) external view returns (Donation[] memory) {
        return donations[userAddress].donations;
    }

    function getDonorAddresses() external view returns (address[] memory) {
        return donorAddresses;
    }

    function getNftContract() external view onlyOwner returns (address) {
        return address(nftContract);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    modifier onlyCreator() {
        require(msg.sender == creator, "Only the creator can call this function");
        _;
    }

}
