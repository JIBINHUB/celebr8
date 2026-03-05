module.exports = {
    apps: [{
        name: 'celebr8-api',
        script: 'index.js',
        instances: 1,
        exec_mode: 'cluster',
        autorestart: true,
        watch: false,
        max_memory_restart: '300M',
        env: {
            NODE_ENV: 'production'
        },
        error_file: './error.log',
        out_file: './server.log',
        log_date_format: 'YYYY-MM-DD HH:mm:ss'
    }]
};
