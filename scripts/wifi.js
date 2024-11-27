const os = require("os");

function getWindowsIP() {
  try {
    const networkInterfaces = os.networkInterfaces();
    for (const interfaceName in networkInterfaces) {
      // Look for interfaces that contain "Wi-Fi"
      if (interfaceName.toLowerCase().includes("wi-fi")) {
        const interfaces = networkInterfaces[interfaceName];
        for (const iface of interfaces) {
          // Skip internal (loopback) addresses
          if (iface.family === "IPv4" && !iface.internal) {
            return iface.address;
          }
        }
      }
    }
    return undefined;
  } catch {
    return undefined;
  }
}

function getLinuxIp() {
  try {
    const networkInterfaces = os.networkInterfaces();
    for (const interfaceName in networkInterfaces) {
      const interfaces = networkInterfaces[interfaceName];
      for (const iface of interfaces) {
        // Skip internal (loopback) addresses
        if (iface.family === "IPv4" && !iface.internal) {
          return iface.address;
        }
      }
    }
    return undefined;
  } catch {
    return undefined;
  }
}

function getWifiIp() {
  try {
    const platform = os.platform();
    if (platform === "win32") {
      return { os: "windows", ip: getWindowsIP() };
    } else if (platform === "linux") {
      const webHostEnv = process.env.WEB_HOST;
      if (webHostEnv && webHostEnv.includes("idx")) {
        return { os: "linux", ip: webHostEnv };
      }
      return { os: "linux", ip: getLinuxIp() };
    } else {
      return { os: "other", ip: undefined };
    }
  } catch {
    return { os: "other", ip: undefined };
  }
}

module.exports = { getWifiIp };
