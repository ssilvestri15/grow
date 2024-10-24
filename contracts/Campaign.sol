// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "./ParticipationNFT.sol";

contract Campaign {
    struct Donation {
        address donor;
        uint256 amount;
    }

    string public title;
    string public description;
    address public creator;
    string public imageBannerUrl;
    string public imagePosterUrl;
    uint256 public target;
    uint256 public currentAmount;
    Donation[] public donations;
    uint256 public deadline;
    ParticipationNFT public nftContract; //Contratto per la creazione di NFT dedicato alla campagna
    bool public isClosed;

    event Donated(address indexed donor, uint256 amount);
    event FundsWithdrawn(address indexed creator, uint256 amount);
    event Refunded(address indexed donor, uint256 amount);

    constructor(
        string memory _title,
        string memory _description,
        string memory _imageBannerUrl,
        string memory _imagePosterUrl,
        uint256 _target,
        uint256 _duration,
        ParticipationNFT _nftContract
    ) {
        title = _title;
        description = _description;
        creator = msg.sender;
        imageBannerUrl = _imageBannerUrl;
        imagePosterUrl = _imagePosterUrl;
        target = _target;
        deadline = block.timestamp + _duration;
        currentAmount = 0;
        isClosed = false;
        nftContract = _nftContract;
    }

    function donate() public payable {
        require(msg.value > 0, "Donation must be greater than zero");
        require(!isClosed, "The campaign is closed");

        donations.push(Donation(msg.sender, msg.value));
        currentAmount += msg.value;

        // Mint NFT per il donatore
        nftContract.mint(msg.sender);
        emit Donated(msg.sender, msg.value);
    }

    function withdrawFunds() public {
        require(msg.sender == creator, "Only the creator can withdraw funds");
        require(currentAmount < target, "Target not met");
        require(
            block.timestamp >= deadline,
            "The campaign has not yet expired"
        );
        require(!isClosed, "The campaign is closed");

        uint256 amount = currentAmount;
        currentAmount = 0;
        isClosed = true;

        payable(creator).transfer(amount);
        emit FundsWithdrawn(creator, amount);
    }

    function refund() public {
        require(
            block.timestamp < deadline,
            "The campaign has not yet expired"
        );
        require(
            currentAmount < target,
            "Goal met, you cannot request a refund"
        );
        require(!isClosed, "The campaign is already closed");

        uint256 amountToRefund = 0;

        for (uint256 i = 0; i < donations.length; i++) {
            if (donations[i].donor == msg.sender) {
                amountToRefund += donations[i].amount;
                donations[i].amount = 0; // Impedisce il doppio rimborso
            }
        }

        require(amountToRefund > 0, "No amount to be repaid");

        payable(msg.sender).transfer(amountToRefund);
        emit Refunded(msg.sender, amountToRefund);

        isClosed = true;
    }

    function getDonations() public view returns (Donation[] memory) {
        return donations;
    }
}
