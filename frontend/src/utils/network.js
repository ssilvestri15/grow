import os from 'os';

export function getWifiIp() {
    const networkInterfaces = os.networkInterfaces();
    for (const interfaceName in networkInterfaces) {
        // Look for interfaces that contain "Wi-Fi"
        if (interfaceName.toLowerCase().includes('wi-fi')) {
            const interfaces = networkInterfaces[interfaceName];
            for (const iface of interfaces) {
                // Skip internal (loopback) addresses
                if (iface.family === 'IPv4' && !iface.internal) {
                    return iface.address;
                }
            }
        }
    }
}