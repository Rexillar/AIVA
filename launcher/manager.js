/**
 * AIVA Process Manager
 * Version: 0.00.1
 * 
 * Description:
 * This script serves as a simple process controller for the AIVA application.
 * It toggles the state of the AIVA local development servers (Client & Server).
 * - If running: It stops them using the stored PIDs.
 * - If stopped: It starts them in the background.
 * 
 * Usage:
 * Run with Node.js: `node manager.js`
 * 
 * License: MIT
 */

const fs = require('fs');
const { spawn, exec } = require('child_process');
const path = require('path');
const os = require('os');

const VERSION = '0.00.1';
const PID_FILE = path.resolve(__dirname, 'aiva-pids.json');
const NOTIFY_SCRIPT = path.resolve(os.tmpdir(), 'aiva_notify.vbs');

// Paths to verifying installation
const CLIENT_DIR = path.resolve(__dirname, '../client');
const SERVER_DIR = path.resolve(__dirname, '../server');
const CLIENT_MODULES = path.join(CLIENT_DIR, 'node_modules');
const SERVER_MODULES = path.join(SERVER_DIR, 'node_modules');

/**
 * Helper to show a simple message box on Windows
 * Uses VBScript to create a native Windows popup without a console window.
 */
function notify(title, message) {
    const vbsScript = `MsgBox "${message}", 64, "${title}"`;
    try {
        fs.writeFileSync(NOTIFY_SCRIPT, vbsScript);

        // Spawn wscript (Windows Script Host) which handles GUI better than cscript
        const child = spawn('wscript', [NOTIFY_SCRIPT], {
            detached: true,
            stdio: 'ignore',
            windowsHide: true
        });

        child.unref();
    } catch (e) {
        // Fail silently if notification system fails
        console.error("Notification failed:", e);
    }
}

/**
 * Pre-flight check to ensure the environment is ready.
 */
function checkDependencies() {
    if (!fs.existsSync(CLIENT_MODULES) || !fs.existsSync(SERVER_MODULES)) {
        notify("AIVA Setup Required", "Dependencies not found. Please run 'npm install' in both client and server directories, or use the setup script.");
        return false;
    }
    return true;
}

// --- Main Execution ---

if (fs.existsSync(PID_FILE)) {
    // --- STOPPING ---
    // If PID file exists, we assume the app is running and attempt to stop it.
    try {
        const pids = JSON.parse(fs.readFileSync(PID_FILE, 'utf8'));

        // Use taskkill to kill the process tree (/T) force (/F)
        pids.forEach(pid => {
            try {
                exec(`taskkill /PID ${pid} /T /F`);
            } catch (err) {
                // Process might be already gone, which is fine.
            }
        });

        try { fs.unlinkSync(PID_FILE); } catch (e) { }
        notify("AIVA Controller", "AIVA Servers Stopped Successfully.");
    } catch (error) {
        notify("AIVA Error", "Failed to stop processes: " + error.message);
    }
} else {
    // --- STARTING ---
    // Check if we have what we need before starting
    if (!checkDependencies()) {
        process.exit(1);
    }

    try {
        // 1. Start Client (Vite)
        // Direct Node execution avoids cmd window popping
        const vitePath = path.join(CLIENT_MODULES, 'vite', 'bin', 'vite.js');
        const client = spawn(process.execPath, [vitePath], {
            cwd: CLIENT_DIR,
            detached: true,
            stdio: 'ignore',
            windowsHide: true
        });

        // 2. Start Server (Nodemon)
        // Direct Node execution avoids cmd window popping
        const nodemonPath = path.join(SERVER_MODULES, 'nodemon', 'bin', 'nodemon.js');
        const server = spawn(process.execPath, [nodemonPath, '--no-deprecation', 'index.js'], {
            cwd: SERVER_DIR,
            detached: true,
            stdio: 'ignore',
            windowsHide: true
        });

        const pids = [client.pid, server.pid];
        fs.writeFileSync(PID_FILE, JSON.stringify(pids));

        // Unref to let them run independently
        client.unref();
        server.unref();

        notify(`AIVA v${VERSION}`, "Servers Started in Background.");
    } catch (error) {
        notify("AIVA Error", "Failed to launch: " + error.message);
    }
}
