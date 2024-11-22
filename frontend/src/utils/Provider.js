import { ethers } from 'ethers';

export async function getProvider(onlyView = true) {
    if (onlyView) {
        let provider = new ethers.JsonRpcProvider(`http://${process.env.REACT_APP_WIFI_IP}:8545`);
        return [provider, null];
    }
    let signer = null;
    let provider;
    if (window.ethereum == null) {
        // If MetaMask is not installed, we use the default provider
        // which is backed by a variety of third-party services (suc
        // as INFURA). They do not have private keys installed
        // so they only have read-only access
        console.log("MetaMask not installed; using read-only defaults")
        provider = ethers.getDefaultProvider()
        return [provider, null];
    } else {
        // Connect to the MetaMask EIP-1193 object. This is a standard
        // protocol that allows Ethers access to make all read-only
        // requests through MetaMask.
        provider = new ethers.BrowserProvider(window.ethereum)
        // It also provides an opportunity to request access to write
        // operations, which will be performed by the private key
        // that MetaMask manages for the user.
        signer = await provider.getSigner();
        return [provider, signer];
    }
}

export function isMetaMaskInstalled() {
    if (window.ethereum == null) {
        return false;
    }
    return true;
}