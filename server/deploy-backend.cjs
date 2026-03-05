const Client = require('ssh2-sftp-client');
const sftp = new Client();
const path = require('path');
const fs = require('fs');

const config = {
    host: '72.61.168.49',
    port: 65002,
    username: 'u519823677',
    password: 'Celebr8@8080'
};

const localServerDir = __dirname;
const targetPath = './domains/honeydew-wolverine-433113.hostingersite.com/backend';

// Production .env content (DB_HOST is localhost on Hostinger since MySQL is local there)
const productionEnv = `PORT=5000
DB_HOST=localhost
DB_NAME=u519823677_celebr8
DB_USER=u519823677_celebr8
DB_PASSWORD=Celebr8@8080
STRIPE_SECRET_KEY=YOUR_STRIPE_SECRET_KEY
STRIPE_PUBLISHABLE_KEY=pk_test_51T6YMkFGopUpbidB2dqRh1uUfhZJ3bcCFAYLB6PIFMXjEw06QmDch9DLlViEcRYGrLbXKQ70MfW9dRzmBEtBLHhY00WD9xtsC4
OWNER_PASSWORD=8080
ADMIN_PASSWORD=3699
FRONTEND_URL=https://honeydew-wolverine-433113.hostingersite.com
`;

async function deployBackend() {
    try {
        await sftp.connect(config);
        console.log('Connected via SFTP');

        // Ensure target directory exists
        const targetExists = await sftp.exists(targetPath);
        if (!targetExists) {
            console.log(`Creating ${targetPath}...`);
            await sftp.mkdir(targetPath, true);
        } else {
            console.log(`Cleaning ${targetPath} (keeping node_modules)...`);
            const contents = await sftp.list(targetPath);
            for (const item of contents) {
                if (item.name === '.' || item.name === '..' || item.name === 'node_modules') continue;
                const fullPath = `${targetPath}/${item.name}`;
                if (item.type === 'd') {
                    await sftp.rmdir(fullPath, true);
                    console.log(`  Deleted DIR: ${item.name}`);
                } else {
                    await sftp.delete(fullPath);
                    console.log(`  Deleted FILE: ${item.name}`);
                }
            }
        }

        // Upload server files (excluding node_modules, .env, deploy scripts)
        console.log('\nUploading backend files...');
        await sftp.uploadDir(localServerDir, targetPath, {
            filter: (source) => {
                const name = path.basename(source);
                const excludeFiles = [
                    'node_modules', '.env', 'deploy-backend.cjs', 'deploy-frontend.cjs',
                    'wipe-hostinger.cjs', 'wipe-local.cjs', 'restart-server.cjs',
                    '.env.production', 'package-lock.json'
                ];
                return !excludeFiles.some(ex => source.includes(ex));
            }
        });

        // Upload production .env
        console.log('Uploading production .env...');
        const envTmpPath = path.join(localServerDir, '.env.production');
        fs.writeFileSync(envTmpPath, productionEnv);
        await sftp.put(envTmpPath, `${targetPath}/.env`);
        fs.unlinkSync(envTmpPath);

        console.log('\n✅ Backend files uploaded to Hostinger!');
        console.log('Next steps on Hostinger:');
        console.log('  1. SSH into server: ssh -p 65002 u519823677@72.61.168.49');
        console.log('  2. cd domains/honeydew-wolverine-433113.hostingersite.com/backend');
        console.log('  3. npm install');
        console.log('  4. npm run seed');
        console.log('  5. npm start (or use PM2/screen)');

    } catch (err) {
        console.error('SFTP Deployment Error:', err.message);
    } finally {
        sftp.end();
    }
}

deployBackend();
