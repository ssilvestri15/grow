const { spawn } = require("child_process");

// Track child processes
const processes = [];

// Gracefully terminate all child processes
function terminateProcesses() {
    console.log("\nTerminating processes...");
    processes.forEach((proc) => {
        if (proc && proc.pid) {
            process.kill(proc.pid, "SIGTERM");
        }
    });
    process.exit(0);
}

// Attach SIGINT handler to terminate on Ctrl+C
process.on("SIGINT", terminateProcesses);

function runCommand(command, args, options = {}, outputMatcher, onMatch) {
    const proc = spawn(command, args, { stdio: "pipe", shell: true, ...options });

    // Store process for later cleanup
    processes.push(proc);

    proc.stdout.on("data", (data) => {
        const output = data.toString();
        console.log(output);
        if (outputMatcher && output.includes(outputMatcher)) {
            onMatch();
        }
    });

    proc.stderr.on("data", (data) => {
        console.error(data.toString());
    });

    proc.on("close", (code) => {
        console.log(`${command} exited with code ${code}`);
    });

    return proc;
}

function startTerminal1() {
    console.log("Starting Terminal 1...");
    const matcher = "Any funds sent to them on Mainnet or any other live network WILL BE LOST.";
    runCommand(
        "npx",
        ["hardhat", "clean", "&&", "npx", "hardhat", "node", "--hostname", "0.0.0.0"],
        {},
        matcher,
        startTerminal2
    );
}

function startTerminal2() {
    console.log("Starting Terminal 2...");
    const deployProcess = runCommand(
        "npx",
        ["hardhat", "run", "scripts/deploy.js", "&&", "npx", "hardhat", "fundwallet", "--to", "0x4AA00907031076F611a38Dc67E31349dB1a78b75", "--amount", "700"]
    );

    deployProcess.on("close", () => {
        startFrontend();
    });
}

function startFrontend() {
    console.log("Starting Frontend...");
    runCommand("npm", ["run", "start"], { cwd: "./frontend" });
}

// Start the process chain
startTerminal1();
