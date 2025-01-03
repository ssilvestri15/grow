// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "./Campaign.sol";
import "./NFTFactory.sol";

contract CrowdfundingFactory {
    Campaign public immutable campaignImplementation; // Base implementation
    NFTFactory public nftFactory;
    address[] public campaigns; // Store addresses of campaign proxies

    event CampaignCreated(string title);

    constructor() {
        campaignImplementation = new Campaign(); // Deploy a single Campaign implementation
        nftFactory = new NFTFactory(); // Deploy a single NFTFactory instance
    }

    function createCampaign(
        string memory _title,
        string memory _description,
        string memory _urlImageBanner,
        string memory _urlImagePoster,
        string memory _nftName,
        string memory _nftSymbol,
        uint256 _target,
        uint256 _duration
    ) external payable {
        require(msg.value == 0.2 ether, "You need to send exactly 0.2 Ether to create a campaign");
        require(_target > 0.4 ether, "Target must be greater than 0.4 ether");
        require(_duration > 0, "Duration must be at least one day");
        require(bytes(_title).length > 0, "Title must not be empty");
        require(bytes(_description).length > 0 && bytes(_description).length <= 1000, "Description must not be empty and be less or equal to 1000 characters");
        require(bytes(_urlImagePoster).length > 0, "Image poster URL must not be empty");
        require(bytes(_urlImageBanner).length > 0, "Image banner URL must not be empty");
        require(bytes(_nftName).length > 0, "NFT name must not be empty");
        require(bytes(_nftSymbol).length > 0, "NFT symbol must not be empty");

        // Create a new NFT contract for the campaign
        address nftAddress = nftFactory.createNFTContract(_nftName, _nftSymbol);

        // Clone the Campaign implementation
        address campaignProxy = createClone(address(campaignImplementation));

        // Initialize the campaign proxy
        Campaign(campaignProxy).initialize(
            _title,
            _description,
            msg.sender,
            address(this),
            _urlImageBanner,
            _urlImagePoster,
            _target,
            _duration,
            nftAddress
        );

        campaigns.push(campaignProxy);
        NFT(nftAddress).setOwner(address(campaignProxy));
        emit CampaignCreated(_title);
    }

    function getCampaigns() external view returns (address[] memory) {
        return campaigns;
    }

    function withdrawFunds(address campaignAddress) external payable{
        Campaign campaign = Campaign(campaignAddress);
        require(msg.sender == campaign.owner(), "You are not the owner of this campaign");
        require(msg.value == 0.2 ether, "You need to send exactly 0.2 Ether to withdraw funds");
        campaign.withdrawFunds();
    }

    // EIP-1167 clone function
    function createClone(address target) internal returns (address result) {
        bytes20 targetBytes = bytes20(target);
        assembly {
            let clone := mload(0x40)
            mstore(clone, 0x3d602d80600a3d3981f3363d3d373d3d3d363d73000000000000000000000000)
            mstore(add(clone, 0x14), targetBytes)
            mstore(add(clone, 0x28), 0x5af43d82803e903d91602b57fd5bf30000000000000000000000000000000000)
            result := create(0, clone, 0x37)
        }
    }
}
