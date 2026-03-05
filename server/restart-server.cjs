const { Client } = require('ssh2');

const CONN = { host: '72.61.168.49', port: 65002, username: 'u519823677', password: 'Celebr8@8080' };
const BACKEND_DIR = '/home/u519823677/domains/honeydew-wolverine-433113.hostingersite.com/backend';

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

async function main() {
    console.log('Installing PM2 locally if missing...');
    await runSSH(`cd ${BACKEND_DIR} && npm install --production`);

    console.log('\nKilling any running server...');
    await runSSH(`cd ${BACKEND_DIR} && npx pm2 kill 2>/dev/null; true`);

    console.log('\nStarting server with PM2...');
    await runSSH(`cd ${BACKEND_DIR} && npx pm2 start ecosystem.config.cjs`);

    console.log('\nSaving PM2 process list...');
    await runSSH(`cd ${BACKEND_DIR} && npx pm2 save`);

    console.log('\nChecking PM2 status:');
    await runSSH(`cd ${BACKEND_DIR} && npx pm2 status`);

    console.log('\n✅ Server started with high-availability!');
}

main().catch(e => { console.error(e); process.exit(1); });
