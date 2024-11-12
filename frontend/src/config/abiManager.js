export const crowdfundingFactoryABI = [
    "function getCampaigns() view returns (address[])"
]

export const campaignABI = [
    "function title() view returns (string)",
    "function description() view returns (string)",
    "function imageBannerUrl() view returns (string)",
    "function imagePosterUrl() view returns (string)",
    "function startDate() view returns (uint256)",
    "function targetAmount() view returns (uint256)",
    "function currentAmount() view returns (uint256)",
    "function getUserDonations(address) view returns ((address, uint256, uint256)[])",
    "function getDonorAddresses() view returns (address[])",
    "function donate() payable",
]