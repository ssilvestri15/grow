export const crowdfundingFactoryABI = [
    "function getCampaigns() view returns (address[])",
    "function createCampaign(string memory _title, string memory _description, string memory _urlImageBanner, string memory _urlImagePoster, string memory _nftName, string memory _nftSymbol, uint256 _target, uint256 _duration) public payable"
]

export const campaignABI = [
    "function title() view returns (string)",
    "function owner() view returns (address)",
    "function description() view returns (string)",
    "function imageBannerUrl() view returns (string)",
    "function imagePosterUrl() view returns (string)",
    "function startDate() view returns (uint256)",
    "function targetAmount() view returns (uint256)",
    "function currentAmount() view returns (uint256)",
    "function getUserDonations(address) view returns ((uint256, uint256)[])",
    "function getDonorAddresses() view returns (address[])",
    "function getNftContract() view returns (address)",
    "function donate() payable",
]

export const nftABI = [
    "function getNFTToken(address) view returns (bytes32)",
]