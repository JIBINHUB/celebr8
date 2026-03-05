const { Client } = require('ssh2');
const conn = new Client();

const config = {
    host: '72.61.168.49',
    port: 65002,
    username: 'u519823677',
    password: 'Celebr8@8080'
};

const commands = [
    'cd domains/honeydew-wolverine-433113.hostingersite.com/backend',
    'npm install --production',
    'npm run seed',
    'pm2 restart ecosystem.config.cjs || pm2 start ecosystem.config.cjs',
    'pm2 save'
];

conn.on('ready', () => {
    console.log('Client :: ready');
    const cmdStr = commands.join(' && ');
    conn.exec(cmdStr, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
            conn.end();
        }).on('data', (data) => {
            console.log('STDOUT: ' + data);
        }).stderr.on('data', (data) => {
            console.log('STDERR: ' + data);
        });
    });
}).connect(config);
