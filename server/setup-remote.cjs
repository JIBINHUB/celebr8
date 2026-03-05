const { Client } = require('ssh2');

const CONN = { host: '72.61.168.49', port: 65002, username: 'u519823677', password: 'Celebr8@8080' };
const BD = '/home/u519823677/domains/honeydew-wolverine-433113.hostingersite.com/backend';

// Hostinger non-interactive SSH needs explicit PATH export
const PATH_FIX = 'export PATH="/opt/alt/alt-nodejs20/root/usr/bin:$PATH"';

function runSSH(cmd, timeout = 180000) {
    return new Promise((resolve, reject) => {
        const conn = new Client();
        const timer = setTimeout(() => { conn.end(); reject(new Error('TIMEOUT')); }, timeout);
        conn.on('ready', () => {
            conn.exec(cmd, (err, stream) => {
                if (err) { clearTimeout(timer); conn.end(); reject(err); return; }
                let out = '';
                stream.on('data', d => { const s = d.toString(); process.stdout.write(s); out += s; });
                stream.stderr.on('data', d => process.stdout.write('[stderr] ' + d.toString()));
                stream.on('close', (code) => { clearTimeout(timer); conn.end(); resolve(out); });
            });
        }).on('error', e => { clearTimeout(timer); reject(e); }).connect(CONN);
    });
}

async function main() {
    console.log("=== STEP 1: npm install ===");
    await runSSH(`${PATH_FIX} && cd ${BD} && npm install --production 2>&1`, 300000);

    console.log("\n=== STEP 2: Seed Database ===");
    await runSSH(`${PATH_FIX} && cd ${BD} && node seed.js 2>&1`, 60000);

    console.log("\n=== STEP 3: Kill old PM2 ===");
    await runSSH(`${PATH_FIX} && cd ${BD} && npx pm2 kill 2>/dev/null; echo "old pm2 killed"`);

    console.log("\n=== STEP 4: Start PM2 ===");
    await runSSH(`${PATH_FIX} && cd ${BD} && npx pm2 start ecosystem.config.cjs 2>&1`);

    console.log("\n=== STEP 5: Save PM2 ===");
    await runSSH(`${PATH_FIX} && cd ${BD} && npx pm2 save 2>&1`);

    console.log("\n=== STEP 6: Status Check ===");
    await runSSH(`${PATH_FIX} && cd ${BD} && npx pm2 status 2>&1`);

    console.log("\n=== STEP 7: API Verification ===");
    await runSSH(`curl -s http://localhost:5000/api/events | head -c 300`);

    console.log("\n\n=== FULL DEPLOYMENT COMPLETE! ===");
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
