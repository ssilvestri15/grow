// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "./ParticipationNFT.sol";

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
    uint256 public target;
    uint256 public currentAmount;
    mapping(address => DonationSummary) public donations;
    address[] public donorAddresses;
    uint256 public deadline;
    ParticipationNFT public nftContract; //Contratto per la creazione di NFT dedicato alla campagna
    bool public isClosed;

    event Donated(address indexed donor, uint256 amount);
    event FundsWithdrawn(address indexed owner, uint256 amount);
    event Refunded(address indexed donor, uint256 amount);

    constructor(
        string memory _title,
        string memory _description,
        address _owner,
        address _creator,
        string memory _imageBannerUrl,
        string memory _imagePosterUrl,
        uint256 _target,
        uint256 _duration, // Durata in giorni
        ParticipationNFT _nftContract
    ) {
        title = _title;
        description = _description;
        owner = _owner;
        creator = _creator;
        imageBannerUrl = _imageBannerUrl;
        imagePosterUrl = _imagePosterUrl;
        target = _target;
        deadline = block.timestamp + (_duration * 86400); // Conversione giorni -> secondi
        currentAmount = 0;
        isClosed = false;
        nftContract = _nftContract;
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
        require(currentAmount > target, "The target has not been reached");
        require(msg.value == ((25*target)/100), "You need to send 25% of the target to withdraw funds");

        uint256 amount = currentAmount;
        currentAmount = 0;
        isClosed = true;

        (bool sent, ) = payable(owner).call{value: amount}("");
        require(sent, "Failed to send Ether");

        emit FundsWithdrawn(owner, amount);
    }

    function refund() public {
        require(!isClosed, "The campaign is already closed");
        require(block.timestamp < deadline,"The campaign has not yet expired");
        require(currentAmount > target,"Goal met, you cannot request a refund");
        require(donations[msg.sender].donor == msg.sender, "Don't be a smart-ass");
        require(donations[msg.sender].totalAmount > 0, "No amount to be repaid");
        uint256 amountToRefund = donations[msg.sender].totalAmount;
        donations[msg.sender].totalAmount = 0; // Impedisce il doppio rimborso

        (bool sent, ) = payable(msg.sender).call{value: amountToRefund}("");
        require(sent, "Failed to send Ether");

        emit Refunded(msg.sender, amountToRefund);
    }

    function getUserDonations(address userAddress) public view returns (Donation[] memory) {
        return donations[userAddress].donations;
    }


    // Generate a pseudo-random number
    function generateRandomNumber(uint256 min, uint256 max) internal view returns (uint256) {
        require(max > min, "Max must be greater than min");

        // Use block.timestamp, block.difficulty, and the sender's address for randomness
        uint256 randomHash = uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, msg.sender)));
        
        // Scale the random number to the desired range
        return (randomHash % (max - min + 1)) + min;
    }

    function getRandomDonations(uint256 count) public view returns (Donation[] memory) {
        // Ensure the number of requested donations is not greater than the available donations
        require(count > 0 && count <= totalDonations(), "Invalid count");

        Donation[] memory randomDonations = new Donation[](count);
        uint256 totalDonors = donorAddresses.length;
        uint256 selectedCount = 0;

        // Track indices already selected to avoid duplicates
        uint256[] memory selectedIndices = new uint256[](count);

        while (selectedCount < count) {
            uint256 randomIndex = generateRandomNumber(0, totalDonors - 1);
            bool alreadySelected = false;

            // Check if this index has already been selected
            for (uint256 i = 0; i < selectedCount; i++) {
                if (selectedIndices[i] == randomIndex) {
                    alreadySelected = true;
                    break;
                }
            }

            // If the random index is unique, add the donation
            if (!alreadySelected) {
                selectedIndices[selectedCount] = randomIndex;
                Donation[] memory donationsFromDonor = donations[donorAddresses[randomIndex]].donations;

                // Randomly select a donation from this donor
                if (donationsFromDonor.length > 0) {
                    uint256 donationRandomIndex = generateRandomNumber(0, donationsFromDonor.length - 1);
                    randomDonations[selectedCount] = donationsFromDonor[donationRandomIndex];
                    selectedCount++;
                }
            }
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

}
