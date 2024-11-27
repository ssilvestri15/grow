import { ethers } from 'ethers';

export async function getProvider(onlyView = true) {
    if (onlyView) {
        let provider;
        const wifiIp = process.env.REACT_APP_WIFI_IP;
        const os = process.env.REACT_APP_OS;
        if (wifiIp === undefined) {
            provider = ethers.getDefaultProvider();
        } else {
            let url;
            const port = 8545;
            const protocol = wifiIp.includes("idx") ? "https" : "http"; // Determine protocol for 'idx' or regular IP
            if (os === "windows") {
                url = protocol + "://" + wifiIp + ":" + port;
            } else {
                if (wifiIp.includes("idx")) {
                    url = "https://8545-" + wifiIp; // Special case for 'idx' in the IP
                } else {
                    url = protocol + "://" + wifiIp + ":" + port;
                }
            }
            console.log("Using URL:", url);
            provider = new ethers.JsonRpcProvider(url);
        }
        return [provider, null];
    }    
    let signer = null;
    let provider;
    if (!isMetaMaskInstalled()) {
        // If MetaMask is not installed, we use the default provider
        // which is backed by a variety of third-party services (suc
        // as INFURA). They do not have private keys installed
        // so they only have read-only access
        console.log("MetaMask not installed; using read-only defaults")
        provider = ethers.getDefaultProvider();
        return [provider, null];
    } else {
        // Connect to the MetaMask EIP-1193 object. This is a standard
        // protocol that allows Ethers access to make all read-only
        // requests through MetaMask.
        console.log("MetaMask is installed! We will use it to sign txs")
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