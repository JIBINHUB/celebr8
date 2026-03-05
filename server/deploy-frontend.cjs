const Client = require('ssh2-sftp-client');
const sftp = new Client();
const path = require('path');

const config = {
    host: '72.61.168.49',
    port: 65002,
    username: 'u519823677',
    password: 'Celebr8@8080'
};

const localDistDir = path.join(__dirname, '../client/dist');
const targetPath = './domains/honeydew-wolverine-433113.hostingersite.com/public_html';

async function deployFrontend() {
    try {
        await sftp.connect(config);
        console.log('Connected via SFTP');

        const targetExists = await sftp.exists(targetPath);
        if (!targetExists) {
            console.log(`Creating ${targetPath}...`);
            await sftp.mkdir(targetPath, true);
        } else {
            console.log(`Cleaning ${targetPath}...`);
            const contents = await sftp.list(targetPath);
            for (const item of contents) {
                if (item.name === '.' || item.name === '..') continue;
                const fullPath = `${targetPath}/${item.name}`;
                if (item.type === 'd') await sftp.rmdir(fullPath, true);
                else await sftp.delete(fullPath);
            }
        }

        console.log('Uploading frontend build...');
        await sftp.uploadDir(localDistDir, targetPath);
        console.log('✅ Frontend successfully deployed to Hostinger!');

    } catch (err) {
        console.error('SFTP Error:', err.message);
    } finally {
        sftp.end();
    }
}

deployFrontend();
