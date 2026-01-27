const fs = require('fs');
const { spawn, exec } = require('child_process');
const path = require('path');
const os = require('os');

const PID_FILE = path.resolve(__dirname, 'aiva-pids.json');
const NOTIFY_SCRIPT = path.resolve(os.tmpdir(), 'aiva_notify.vbs');

// Helper to show a simple message box on Windows
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
    }
}

if (fs.existsSync(PID_FILE)) {
    // --- STOPPING ---
    try {
        const pids = JSON.parse(fs.readFileSync(PID_FILE, 'utf8'));

        // Use taskkill to kill the process tree (/T) force (/F)
        pids.forEach(pid => {
            try {
                exec(`taskkill /PID ${pid} /T /F`);
            } catch (err) {
                // Process might be already gone
            }
        });

        try { fs.unlinkSync(PID_FILE); } catch (e) { }
        notify("AIVA Controller", "AIVA Servers Stopped Successfully.");
    } catch (error) {
        notify("AIVA Error", "Failed to stop processes: " + error.message);
    }
} else {
    // --- STARTING ---
    try {
        // 1. Start Client (Vite)
        // Direct Node execution avoids cmd window popping
        const vitePath = path.resolve(__dirname, 'client', 'node_modules', 'vite', 'bin', 'vite.js');
        const client = spawn(process.execPath, [vitePath], {
            cwd: path.resolve(__dirname, 'client'),
            detached: true,
            stdio: 'ignore',
            windowsHide: true
        });

        // 2. Start Server (Nodemon)
        // Direct Node execution avoids cmd window popping
        const nodemonPath = path.resolve(__dirname, 'server', 'node_modules', 'nodemon', 'bin', 'nodemon.js');
        const server = spawn(process.execPath, [nodemonPath, '--no-deprecation', 'index.js'], {
            cwd: path.resolve(__dirname, 'server'),
            detached: true,
            stdio: 'ignore',
            windowsHide: true
        });

        const pids = [client.pid, server.pid];
        fs.writeFileSync(PID_FILE, JSON.stringify(pids));

        // Unref to let them run independently
        client.unref();
        server.unref();

        notify("AIVA Controller", "AIVA Servers Started in Background.");
    } catch (error) {
        notify("AIVA Error", "Failed to launch: " + error.message);
    }
}
