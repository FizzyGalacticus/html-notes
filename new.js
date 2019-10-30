#!/usr/bin/env node
'use strict';

const { promisify } = require('util');
const childProcess = require('child_process');
const fs = require('fs');
const path = require('path');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const exec = promisify(childProcess.exec);

const args = process.argv.slice(2);

const TEMPLATE_FILE = path.join(__dirname, 'template.html');
const NOTES_DIR = path.join(__dirname, 'gh-pages');

const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];

const getDate = () => {
    const now = new Date();

    const month = months[now.getMonth()];
    const weekDay = weekDays[now.getDay() - 1];
    const day = now.getDate();
    const year = now.getFullYear();

    return `${weekDay} ${month} ${day}, ${year}`;
};

const checkIfVSCodeInstalled = async () => {
    try {
        await exec('command -v code');
        return true;
    } catch (err) {
        // Just eat it
        return false;
    }
};

const main = async () => {
    try {
        let template = await readFile(TEMPLATE_FILE, 'utf-8');
        const date = getDate();

        template = template.replace(/{{ TITLE }}/gim, args.length ? args.join(' ') : date);

        const newTemplateFilename = (args.length ? args.join(' ') : date)
            .replace(/\W|_/gim, ' ')
            .split(' ')
            .filter(s => s.length)
            .map(s => s.trim())
            .join('-')
            .toLowerCase();

        const newTemplatePath = path.join(NOTES_DIR, `${newTemplateFilename}.html`);

        await writeFile(newTemplatePath, template);

        const vscodeInstalled = await checkIfVSCodeInstalled();

        if (vscodeInstalled) {
            await exec(`code ${newTemplatePath}`);
        }
    } catch (err) {
        console.error(err);
    }
};

if (require.main === module) {
    main();
}
