const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const CONN = { host: '72.61.168.49', port: 65002, username: 'u519823677', password: 'Celebr8@8080' };
const PUBLIC_HTML = '/home/u519823677/domains/honeydew-wolverine-433113.hostingersite.com/public_html';

function runSSH(cmd) {
    return new Promise((resolve, reject) => {
        const conn = new Client();
        conn.on('ready', () => {
            conn.exec(cmd, (err, stream) => {
                if (err) { conn.end(); reject(err); return; }
                let out = '';
                stream.on('data', d => { const s = d.toString(); process.stdout.write(s); out += s; });
                stream.stderr.on('data', d => process.stdout.write('[stderr] ' + d.toString()));
                stream.on('close', () => { conn.end(); resolve(out); });
            });
        }).on('error', reject).connect(CONN);
    });
}

function uploadFile(localPath, remotePath) {
    return new Promise((resolve, reject) => {
        const conn = new Client();
        conn.on('ready', () => {
            conn.sftp((err, sftp) => {
                if (err) { conn.end(); reject(err); return; }
                const content = fs.readFileSync(localPath);
                const ws = sftp.createWriteStream(remotePath);
                ws.on('close', () => { conn.end(); resolve(); });
                ws.on('error', e => { conn.end(); reject(e); });
                ws.write(content);
                ws.end();
            });
        }).on('error', reject).connect(CONN);
    });
}

async function main() {
    // Upload api-proxy.php
    console.log("Uploading api-proxy.php...");
    const proxyPath = path.join(__dirname, '..', 'client', 'public', 'api-proxy.php');
    await uploadFile(proxyPath, `${PUBLIC_HTML}/api-proxy.php`);
    console.log("✅ api-proxy.php uploaded!");

    // Upload .htaccess
    console.log("Uploading .htaccess...");
    const htaccessPath = path.join(__dirname, '..', 'client', 'public', '.htaccess');
    await uploadFile(htaccessPath, `${PUBLIC_HTML}/.htaccess`);
    console.log("✅ .htaccess uploaded!");

    // Verify
    console.log("\nVerifying public API...");
    await runSSH(`curl -s http://localhost:5000/api/events | head -c 100`);
    console.log("\n\n✅ API Proxy deployed!");
}

main().catch(e => { console.error(e); process.exit(1); });
