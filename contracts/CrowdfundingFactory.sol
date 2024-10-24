// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "./Campaign.sol";
import "./NFTFactory.sol";
import "./NFT.sol";

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
        string memory _nftName,
        string memory _nftSymbol,
        uint256 _target,
        uint256 _duration
    ) public payable {
        require(msg.value == 0.2 ether, "You need to send exactly 0.2 Ether to create a campaign");
        require(_target > 0, "Target must be greater than zero");
        require(_duration > 0, "Duration must be at least one day");
        require(bytes(_title).length > 0, "Title must not be empty");
        require(bytes(_description).length > 0, "Description must not be empty");
        require(bytes(_urlImagePoster).length > 0, "Image poster URL must not be empty");
        require(bytes(_urlImageBanner).length > 0, "Image banner URL must not be empty");
        require(bytes(_nftName).length > 0, "NFT name must not be empty");
        require(bytes(_nftSymbol).length > 0, "NFT symbol must not be empty");

        // Crea un nuovo contratto NFT per questa campagna
        address nftAddress = nftFactory.createNFTContract(_nftName, _nftSymbol);

        // Crea una nuova campagna con l'indirizzo del contratto NFT
        Campaign campaign = new Campaign(
            _title,
            _description,
            msg.sender,
            address(this),
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
