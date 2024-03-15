/**
 * Created by Nikolay Glushchenko (nick@nickalie.com) on 03.01.2018.
 */

const fs = require('fs');
const path = require('path');
const shell = require('shelljs');

buildPackage();

async function buildPackage() {
    const content = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const buildNum = process.env.CIRCLE_BUILD_NUM;

    if (buildNum != null) {
        const version = content.version.split('.');
        version[2] = buildNum;
        content.version = version.join('.');
    }

    delete content.devDependencies;
    delete content.scripts;
    delete content.husky;
    content.main = 'index.js';
    content.types = 'index.d.ts';
    fs.writeFileSync(path.join('dist', 'package.json'), JSON.stringify(content, null, 2), 'utf8');
    shell.cp('.npmrc', path.join('dist', '.npmrc'));
}
