import contractAddresses from "../config/contractAddresses.json";

let factoryAddress = "";

export function getCrowdfundingFactoryAddress() {
  if (factoryAddress === "") {
    try {
      factoryAddress = contractAddresses["localhost"]["crowdfundingFactory"];
    } catch {
      factoryAddress = "";
    }
  }
  return factoryAddress;
}