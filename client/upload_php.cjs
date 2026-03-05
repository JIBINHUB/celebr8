const Client = require('ssh2-sftp-client');
const sftp = new Client();

const config = {
    host: '72.61.168.49',
    port: 65002,
    username: 'u519823677',
    password: 'Celebr8@8080'
};

async function uploadBridge() {
    try {
        await sftp.connect(config);
        console.log('Connected via SFTP');

        const remotePath = './domains/honeydew-wolverine-433113.hostingersite.com/public_html/remote_seed.php';
        const localPath = './remote_seed.php';

        await sftp.put(localPath, remotePath);
        console.log('Successfully uploaded remote_seed.php to public_html');

    } catch (err) {
        console.error('SFTP Upload Error:', err.message);
    } finally {
        sftp.end();
    }
}

uploadBridge();
