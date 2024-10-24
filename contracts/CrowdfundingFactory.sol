// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "./Campaign.sol";
import "./NFTFactory.sol";
import "./ParticipationNFT.sol";

contract CrowdfundingFactory {

    Campaign[] public campaigns;
    NFTFactory public nftFactory;
    
    event CampaignCreated(address campaignAddress, string title, address creator);

    constructor() {
        nftFactory = new NFTFactory();
    }

    function createCampaign(
        string memory _title,
        string memory _description,
        string memory _urlImagePoster,
        string memory _urlImageBanner,
        uint256 _target,
        uint256 _duration
    ) public payable {
        require(msg.value == 10 ether, "Devi inviare esattamente 10$ in Ether");

        // Crea un nuovo contratto NFT per questa campagna
        string memory nftName = string(abi.encodePacked(_title, " NFT"));
        string memory nftSymbol = "PART";
        ParticipationNFT nftAddress = nftFactory.createNFTContract(nftName, nftSymbol);

        // Crea una nuova campagna con l'indirizzo del contratto NFT
        Campaign campaign = new Campaign(
            _title,
            _description,
            _urlImagePoster,
            _urlImageBanner,
            _target,
            _duration,
            nftAddress
        );

        campaigns.push(campaign);
        emit CampaignCreated(address(campaign), _title, msg.sender);
    }

    function getCampaigns() public view returns (Campaign[] memory) {
        return campaigns;
    }
}
