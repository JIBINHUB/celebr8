import { Client } from 'ssh2';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const conn = new Client();
const config = {
    host: '72.61.168.49',
    port: 65002,
    username: 'u519823677',
    password: 'Celebr8@8080'
};

const localDistDir = path.join(__dirname, 'client', 'dist');
const remotePublicHtml = '/home/u519823677/domains/honeydew-wolverine-433113.hostingersite.com/public_html';

console.log('Connecting to Hostinger SSH/SFTP...');

conn.on('ready', () => {
    console.log('SSH connection ready. Ensuring remote directories exist...');

    // First, use SSH to execute `mkdir -p` which is much more reliable than recursive SFTP mkdir
    conn.exec(`mkdir -p ${remotePublicHtml}/assets`, (err, stream) => {
        if (err) throw err;

        stream.on('close', (code, signal) => {
            console.log('Remote directories prepared. Starting SFTP transfer...');

            conn.sftp((err, sftp) => {
                if (err) throw err;

                const uploadDir = async (localPath, remotePath) => {
                    const items = fs.readdirSync(localPath);

                    for (const item of items) {
                        const currentLocalPath = path.join(localPath, item);
                        const currentRemotePath = `${remotePath}/${item}`;
                        const stat = fs.statSync(currentLocalPath);

                        if (stat.isDirectory()) {
                            // we know assets is the only nested folder in a standard Vite build
                            await uploadDir(currentLocalPath, currentRemotePath);
                        } else {
                            await new Promise((resolve, reject) => {
                                sftp.fastPut(currentLocalPath, currentRemotePath, (err) => {
                                    if (err) {
                                        console.error(`Error uploading ${item}:`, err.message);
                                        reject(err);
                                    } else {
                                        console.log(`Uploaded: ${currentRemotePath}`);
                                        resolve();
                                    }
                                });
                            });
                        }
                    }
                };

                uploadDir(localDistDir, remotePublicHtml)
                    .then(() => {
                        console.log('Frontend upload complete!');
                        conn.end();
                    })
                    .catch(err => {
                        console.error('Upload failed:', err);
                        conn.end();
                    });
            });

        }).on('data', (data) => {
            console.log(`SSH output: ${data}`);
        }).stderr.on('data', (data) => {
            console.error(`SSH stderr: ${data}`);
        });
    });

}).on('error', (err) => {
    console.error('Connection error:', err);
}).connect(config);
