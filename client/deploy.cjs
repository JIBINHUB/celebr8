const Client = require('ssh2-sftp-client');
const sftp = new Client();

const config = {
    host: '72.61.168.49',
    port: 65002,
    username: 'u519823677',
    password: 'Celebr8@8080'
};

async function deploy() {
    try {
        await sftp.connect(config);
        console.log('Connected via SFTP');
        const list = await sftp.list('.');
        console.log('Root directory contents: ', list.map(i => `${i.name} (${i.type})`).join(', '));

        let targetPath = './public_html';

        // Check if inside domains (Hostinger typical structure)
        const hasDomains = list.find(i => i.name === 'domains');
        if (hasDomains) {
            const domainsList = await sftp.list('./domains');
            console.log('Domains: ', domainsList.map(i => i.name).join(', '));
            const myDomain = domainsList.find(i => i.type === 'd');
            if (myDomain) {
                const domainContents = await sftp.list(`./domains/${myDomain.name}`);
                if (domainContents.find(i => i.name === 'public_html')) {
                    targetPath = `./domains/${myDomain.name}/public_html`;
                }
            }
        }

        // Check if public_html is directly in root
        const hasPublicHtml = list.find(i => i.name === 'public_html');
        if (hasPublicHtml) {
            targetPath = './public_html';
        }

        console.log(`\nTarget Path resolved to: ${targetPath}`);

        // Check if target directory exists
        const targetExists = await sftp.exists(targetPath);
        if (!targetExists) {
            console.log(`Creating ${targetPath}...`);
            await sftp.mkdir(targetPath, true);
        } else {
            // We will delete the contents inside instead of deleting public_html itself to avoid strict permissions errors
            console.log(`Emptying ${targetPath}...`);
            const contents = await sftp.list(targetPath);
            for (const item of contents) {
                if (item.name === '.' || item.name === '..') continue;
                const fullPath = `${targetPath}/${item.name}`;
                if (item.type === 'd') {
                    await sftp.rmdir(fullPath, true);
                    console.log(`Deleted DIR: ${item.name}`);
                } else {
                    await sftp.delete(fullPath);
                    console.log(`Deleted FILE: ${item.name}`);
                }
            }
        }

        // Upload dist
        console.log('\nUploading new build (dist) folder...');
        const localPath = './dist';
        await sftp.uploadDir(localPath, targetPath);
        console.log('\n✅ Upload complete! Your new React App is live on Hostinger.');

    } catch (err) {
        console.error('SFTP Deployment Error:', err.message);
    } finally {
        sftp.end();
    }
}

deploy();
