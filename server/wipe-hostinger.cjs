const { Client } = require('ssh2');

const CONN = { host: '72.61.168.49', port: 65002, username: 'u519823677', password: 'Celebr8@8080' };

const STMT_DROP_DB = `mysql -u u519823677_celebr8 -p'Celebr8@8080' u519823677_celebr8 -e "SET FOREIGN_KEY_CHECKS = 0; DROP TABLE IF EXISTS Tickets; DROP TABLE IF EXISTS Bookings; DROP TABLE IF EXISTS SeatInventories; DROP TABLE IF EXISTS Events; DROP TABLE IF EXISTS Users; SET FOREIGN_KEY_CHECKS = 1;"`;
const STMT_RM_BACKEND = `rm -rf /home/u519823677/domains/honeydew-wolverine-433113.hostingersite.com/backend`;
const STMT_RM_PROXY = `rm -f /home/u519823677/domains/honeydew-wolverine-433113.hostingersite.com/public_html/api-proxy.php`;

function runSSH(cmd) {
    return new Promise((resolve, reject) => {
        const conn = new Client();
        conn.on('ready', () => {
            conn.exec(cmd, (err, stream) => {
                if (err) { conn.end(); reject(err); return; }
                let out = '';
                stream.on('data', d => { const s = d.toString(); process.stdout.write(s); out += s; });
                stream.stderr.on('data', d => process.stdout.write('[err] ' + d.toString()));
                stream.on('close', () => { conn.end(); resolve(out); });
            });
        }).on('error', reject).connect(CONN);
    });
}

async function main() {
    console.log("=== ANNIHILATING HOSTINGER ENVIRONMENT ===");
    console.log("1. Dropping MySQL Tables...");
    await runSSH(STMT_DROP_DB);
    console.log("2. Deleting backend folder...");
    await runSSH(STMT_RM_BACKEND);
    console.log("3. Deleting API Proxy...");
    await runSSH(STMT_RM_PROXY);
    console.log("=== WIPE COMPLETE ===");
}

main().catch(e => { console.error(e); process.exit(1); });
