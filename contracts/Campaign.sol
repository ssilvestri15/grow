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
    Donation[] public failedRefounds;
    uint256 public deadline;
    uint256 public startDate;
    NFT public nftContract; //Contratto per la creazione di NFT dedicato alla campagna
    bool public isClosed;

    event Donated(address indexed donor, uint256 amount);
    event FundsWithdrawn(address indexed owner, uint256 amount);
    event Refunded(address indexed donor, uint256 amount);
    event CampaignClosed(string title);

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
        isClosed = false;
        nftContract = NFT(_nftContract);
    }

    function donate() public payable {
        require(msg.value > 0, "Donation must be greater than zero");
        require(!isClosed, "The campaign is closed");

        DonationSummary storage summary = donations[msg.sender];
        
        if (summary.donor != msg.sender) {
            summary.donor = msg.sender;
            summary.totalAmount = 0;
            // Mint NFT per il donatore
            nftContract.mint(msg.sender);
        }
        
        summary.totalAmount += msg.value;
        summary.donations.push(Donation(msg.sender, msg.value, block.timestamp));
        donorAddresses.push(msg.sender);
        currentAmount += msg.value;
        emit Donated(msg.sender, msg.value);
    }

    function withdrawFunds() payable public {
        require(msg.sender == owner, "Only the owner can withdraw funds");
        require(block.timestamp >= deadline,"The campaign has not yet expired");
        require(currentAmount > targetAmount, "The targetAmount has not been reached");
        require(msg.value == 0.2 ether, "You need to 0.2 ether to withdraw funds");

        uint256 amount = currentAmount;
        currentAmount = 0;
        isClosed = true;

        (bool sent, ) = payable(owner).call{value: amount}("");
        require(sent, "Failed to send Ether");

        emit FundsWithdrawn(owner, amount);
    }

    function closeCampaignAndRefund() public {
        require(!isClosed, "The campaign is already closed");
        require(msg.sender == owner || msg.sender == creator, "You can't close this campaign");
        isClosed = true;

        uint256 failed = 0;

        for (uint256 i = 0; i < donorAddresses.length; i++) {
            uint256 amountToRefund = donations[donorAddresses[i]].totalAmount;
            donations[donorAddresses[i]].totalAmount = 0;
            (bool sent, ) = payable(donorAddresses[i]).call{value: amountToRefund}("");
            if (!sent) {
                failed++;
                failedRefounds.push(Donation(donorAddresses[i], amountToRefund, block.timestamp));
            }
        }

        require(failed == 0, "Failed to refund all donors");

        emit CampaignClosed(title);
    }

    function retryRefund() public {
        require(msg.sender == owner || msg.sender == creator, "Only the owner or the creator can retry refunds");
        require(failedRefounds.length > 0, "No failed refunds to retry");

        uint256 failed = 0;

        // Iterate in reverse to safely remove elements
        for (uint256 i = failedRefounds.length; i > 0; i--) {
            uint256 index = i - 1;
            uint256 amountToRefund = failedRefounds[index].amount;
            (bool sent, ) = payable(failedRefounds[index].donor).call{value: amountToRefund}("");

            if (!sent) {
                failed++;
            } else {
                // Remove the refunded donation from the failed refunds list
                failedRefounds[index] = failedRefounds[failedRefounds.length - 1];
                failedRefounds.pop();
            }
        }

        require(failed == 0, "Failed to refund all donors");
    }


    function getUserDonations(address userAddress) public view returns (Donation[] memory) {
        return donations[userAddress].donations;
    }


    // Generate a pseudo-random number
    function generateRandomNumber(uint256 max) internal view returns (uint256) {// Genera un numero pseudocasuale compreso tra 0 e max
        return uint256(keccak256(abi.encodePacked(block.prevrandao, msg.sender))) % max;
    }

    function getRandomDonations(uint256 count) public view returns (Donation[] memory) {
        // Ensure the number of requested donations is not greater than the available donations
        require(count > 0 && count <= totalDonations(), "Invalid count");
        Donation[] memory randomDonations = new Donation[](count);
        uint256 selected = 0;

        while (selected < count) {
            uint256 randomIndex = generateRandomNumber(donorAddresses.length);
            DonationSummary storage summary = donations[donorAddresses[randomIndex]];
            uint256 randomDonationIndex = generateRandomNumber(summary.donations.length);
            randomDonations[selected] = summary.donations[randomDonationIndex];
            selected++;
        }

        return randomDonations;
    }

    function totalDonations() internal view returns (uint256) {
        uint256 total = 0;
        for (uint256 i = 0; i < donorAddresses.length; i++) {
            total += donations[donorAddresses[i]].donations.length;
        }
        return total;
    }

    function getDonorAddresses() public view returns (address[] memory) {
        return donorAddresses;
    }

    function getNftContract() public view onlyOwner returns (address) {
        return address(nftContract);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

}
