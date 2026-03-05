const fs = require('fs');
const path = require('path');

const keepFiles = ['.env', 'package.json', 'package-lock.json', 'deploy-frontend.cjs', 'deploy-backend.cjs'];
const keepDirs = ['node_modules'];

const dir = __dirname;
const items = fs.readdirSync(dir);

console.log("=== WIPING LOCAL BACKEND ===");
for (const item of items) {
    if (keepFiles.includes(item) || keepDirs.includes(item) || item === 'wipe-local.cjs' || item === 'wipe-hostinger.cjs') {
        console.log(`Keeping: ${item}`);
        continue;
    }

    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
        fs.rmSync(fullPath, { recursive: true, force: true });
        console.log(`Deleted DIR: ${item}`);
    } else {
        fs.rmSync(fullPath, { force: true });
        console.log(`Deleted FILE: ${item}`);
    }
}
console.log("=== LOCAL WIPE COMPLETE ===");
